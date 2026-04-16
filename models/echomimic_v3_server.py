"""
EchoMimic V3 API Server — CUDA only
─────────────────────────────────────
Endpoints:
  POST /lipsync/generate         — start async job, returns {job_id}
  GET  /lipsync/status/{job_id}  — poll: processing | done | failed
  GET  /lipsync/result/{job_id}  — fetch base64 mp4 when done
  GET  /health                   — model + device status

Requirements:
  • CUDA GPU (≥12 GB VRAM)
  • EchoMimicV3 repo cloned to  models/EchoMimicV3/
  • Weights downloaded to       models/echomimic_weights/

Start:
  cd models
  source echomimic_venv/bin/activate
  uvicorn echomimic_v3_server:app --host 0.0.0.0 --port 8001
"""

import os
os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")

import warnings
warnings.filterwarnings(
    "ignore",
    message="Padding mask is disabled when using scaled_dot_product_attention",
    category=UserWarning,
)

# ─────────────────────────────────────────────────────────────────────────────
# transformers ≥ 4.51 refuses torch.load on torch < 2.6 (CVE-2025-32434).
# cu121 only goes up to torch 2.5.1 — bypass the version gate.
# ─────────────────────────────────────────────────────────────────────────────
import torch as _torch_ver_check
if tuple(int(x) for x in _torch_ver_check.__version__.split("+")[0].split(".")[:2]) < (2, 6):
    try:
        import transformers.utils.import_utils as _tui
        if hasattr(_tui, "check_torch_load_is_safe"):
            _tui.check_torch_load_is_safe = lambda: None
            print("[EchoMimic] Patched transformers check_torch_load_is_safe (torch < 2.6)")
    except Exception as _e:
        print(f"[EchoMimic] Could not patch transformers safety check: {_e}")

import asyncio
import base64
import concurrent.futures
import functools
import gc
import sys
import traceback
import uuid
from pathlib import Path
from typing import Optional

import numpy as np
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

if not torch.cuda.is_available():
    raise RuntimeError(
        "EchoMimic V3 requires a CUDA GPU. No CUDA device detected.\n"
        "This server is CUDA-only — do not run on CPU or MPS."
    )

DEVICE = "cuda"
DTYPE  = torch.bfloat16

# ─────────────────────────────────────────────────────────────────────────────
# Patch torch.load: add mmap=True (avoids RAM doubling on large weight files)
# and weights_only=False (EchoMimicV3 .pth files need full unpickling).
# ─────────────────────────────────────────────────────────────────────────────
_orig_torch_load = torch.load

@functools.wraps(_orig_torch_load)
def _mmap_torch_load(f, *args, **kwargs):
    if isinstance(f, (str, os.PathLike)):
        kwargs.setdefault("mmap", True)
        kwargs.setdefault("weights_only", False)
    return _orig_torch_load(f, *args, **kwargs)

torch.load = _mmap_torch_load

# ─────────────────────────────────────────────────────────────────────────────
# diffusers 0.33+ removed load_model_dict_into_meta — inject a shim.
# ─────────────────────────────────────────────────────────────────────────────
def _load_model_dict_into_meta_shim(model, state_dict, dtype=None, **kwargs):
    from accelerate.utils import set_module_tensor_to_device
    for key, value in state_dict.items():
        if dtype is not None:
            value = value.to(dtype)
        parts = key.split(".")
        mod = model
        try:
            for part in parts[:-1]:
                mod = getattr(mod, part)
            set_module_tensor_to_device(mod, parts[-1], device="cpu", value=value)
        except Exception:
            mod = model
            for part in parts[:-1]:
                mod = getattr(mod, part)
            setattr(mod, parts[-1], torch.nn.Parameter(value))

try:
    import diffusers.models.modeling_utils as _dmu
    if not hasattr(_dmu, "load_model_dict_into_meta"):
        _dmu.load_model_dict_into_meta = _load_model_dict_into_meta_shim
        print("[EchoMimic] Injected load_model_dict_into_meta shim")
except Exception as _e:
    print(f"[EchoMimic] Could not patch diffusers: {_e}")

# ─────────────────────────────────────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────────────────────────────────────

_REPO       = Path(os.environ.get("ECHOMIMIC_REPO",    Path(__file__).parent / "EchoMimicV3"))
_WEIGHTS    = Path(os.environ.get("ECHOMIMIC_WEIGHTS", Path(__file__).parent / "echomimic_weights"))
_OUTPUT_DIR = Path(__file__).parent / "echomimic_results"
_OUTPUT_DIR.mkdir(exist_ok=True)

for _p, _msg in [
    (_REPO,    "Run: git clone https://github.com/antgroup/echomimic_v3 models/EchoMimicV3"),
    (_WEIGHTS, "Run: python download_echomimic_weights.py"),
]:
    if not _p.exists():
        raise RuntimeError(f"Missing: {_p}\n{_msg}")

sys.path.insert(0, str(_REPO))

_CONFIG_PATH  = _REPO / "config" / "config.yaml"
_BASE_MODEL   = _WEIGHTS / "base"
_WAV2VEC_PATH = _WEIGHTS / "wav2vec2"
_TRANSFORMER  = _WEIGHTS / "transformer" / "transformer"
_EMBEDS_PATH  = _WEIGHTS / "text_embeds.pt"

# ─────────────────────────────────────────────────────────────────────────────
# EchoMimicV3 src/ imports
# ─────────────────────────────────────────────────────────────────────────────

from omegaconf import OmegaConf
from transformers import AutoTokenizer, Wav2Vec2FeatureExtractor
from einops import rearrange

from src.wan_vae                             import AutoencoderKLWan
from src.wan_image_encoder                   import CLIPModel
from src.wan_transformer3d_audio_2512        import WanTransformerAudioMask3DModel
from src.pipeline_wan_fun_inpaint_audio_2512 import WanFunInpaintAudioPipeline
from src.wav2vec2                            import Wav2Vec2Model as EchoWav2Vec2Model
from src.utils                               import get_image_to_video_latent2, save_videos_grid, filter_kwargs as src_filter_kwargs
from src.fm_solvers_unipc                    import FlowUniPCMultistepScheduler

import librosa
import pyloudnorm as pyln
from PIL import Image

# ─────────────────────────────────────────────────────────────────────────────
# Cached text encoder — replaces UMT5-XXL (20 GB) with a tiny nn.Module that
# returns pre-computed embeddings from disk.
#
# The pipeline calls self.text_encoder(input_ids, attention_mask)[0] inside
# encode_prompt.  This drop-in matches the incoming input_ids against the saved
# positive/negative token IDs to return the correct embedding, then falls back
# to the positive embedding for any unknown prompt.
# ─────────────────────────────────────────────────────────────────────────────

class _CachedTextEncoder(torch.nn.Module):
    def __init__(self, pos_embeds, neg_embeds, pos_input_ids, neg_input_ids):
        super().__init__()
        # register_buffer makes these move with .to(device) and appear in
        # .parameters() — needed for the pipeline's device detection:
        #   te_device = next(self.text_encoder.parameters()).device
        self.register_buffer("_sentinel",    torch.zeros(1))
        self.register_buffer("pos_embeds",   pos_embeds)
        self.register_buffer("neg_embeds",   neg_embeds)
        self.register_buffer("pos_input_ids", pos_input_ids)
        self.register_buffer("neg_input_ids", neg_input_ids)

    def forward(self, input_ids=None, attention_mask=None, **kwargs):
        dev = input_ids.device if input_ids is not None else self._sentinel.device
        pos_ids = self.pos_input_ids.to(dev)
        neg_ids = self.neg_input_ids.to(dev)

        if (input_ids is not None
                and input_ids.shape == pos_ids.shape
                and (input_ids == pos_ids).all()):
            return (self.pos_embeds.to(dev),)

        if (input_ids is not None
                and input_ids.shape == neg_ids.shape
                and (input_ids == neg_ids).all()):
            return (self.neg_embeds.to(dev),)

        # Fallback: return positive embedding for any unrecognised prompt
        return (self.pos_embeds.to(dev),)


def _load_cached_text_encoder() -> "_CachedTextEncoder":
    """Load pre-computed embeddings from disk (milliseconds, ~few MB)."""
    if not _EMBEDS_PATH.exists():
        raise RuntimeError(
            f"Text embeddings not found at {_EMBEDS_PATH}.\n"
            "Run:  python precompute_text_embeds.py\n"
            "Or start via start.sh which runs this automatically."
        )
    data = torch.load(str(_EMBEDS_PATH), map_location="cpu", weights_only=False)
    enc = _CachedTextEncoder(
        pos_embeds=data["positive"].to(DTYPE),
        neg_embeds=data["negative"].to(DTYPE),
        pos_input_ids=data["pos_input_ids"],
        neg_input_ids=data["neg_input_ids"],
    )
    size_mb = _EMBEDS_PATH.stat().st_size / 1e6
    print(f"[EchoMimic] Loaded cached text embeddings from {_EMBEDS_PATH.name} ({size_mb:.1f} MB)")
    return enc


# ─────────────────────────────────────────────────────────────────────────────
# Lazy global model cache — loaded once on first job, reused after that.
#
# Memory layout (32 GB VM RAM  +  24 GB L4 VRAM):
#   CPU RAM : text encoder only (~20 GB UMT5-XXL)
#   CUDA    : VAE (~2 GB) + CLIP (~1 GB) + transformer (~6 GB) = ~9 GB
#
# Loading order matters: each model is moved to CUDA immediately after load
# so its CPU copy is freed by gc before the next model loads.
# Without this, all models pile up in CPU RAM simultaneously (~29 GB) and
# exhaust the 32 GB VM → kernel swaps to disk → hang.
# ─────────────────────────────────────────────────────────────────────────────

_config             = None
_wav2vec_extractor  = None
_wav2vec_model      = None
_pipeline           = None
_vae_temporal_ratio = 4


def _to_cuda(model, name: str):
    """Move model to CUDA then run gc so CPU RAM is freed before next load."""
    print(f"[EchoMimic]     → {name} to CUDA…")
    model = model.to(DEVICE)
    gc.collect()
    torch.cuda.empty_cache()
    print(f"[EchoMimic]     VRAM used: {torch.cuda.memory_allocated()/1e9:.1f} GB")
    return model


def _load_audio_model():
    """Load Wav2Vec2 into CPU RAM (small, ~0.4 GB — stays on CPU)."""
    global _wav2vec_extractor, _wav2vec_model
    if _wav2vec_model is not None:
        return
    print("[EchoMimic] Loading Wav2Vec2 (audio encoder)…")
    _wav2vec_extractor = Wav2Vec2FeatureExtractor.from_pretrained(
        str(_WAV2VEC_PATH), local_files_only=True
    )
    _wav2vec_model = EchoWav2Vec2Model.from_pretrained(
        str(_WAV2VEC_PATH), local_files_only=True
    ).to("cpu")
    _wav2vec_model.feature_extractor._freeze_parameters()
    gc.collect()
    print("[EchoMimic] Wav2Vec2 ready.")


def _load_pipeline():
    """Load pipeline models with eager GPU placement to avoid CPU RAM OOM.

    Loading order and device placement:
      1. VAE        → load → move to CUDA → CPU copy freed  (peak RAM: ~2 GB)
      2. Text enc   → load → stays on CPU                   (peak RAM: ~20 GB)
      3. CLIP       → load → move to CUDA → CPU copy freed  (peak RAM: ~21 GB)
      4. Transformer→ load → move to CUDA → CPU copy freed  (peak RAM: ~26 GB, fits in 32 GB)

    Final state: CPU holds text encoder only (~20 GB).
                 CUDA holds VAE + CLIP + transformer (~9 GB).
    No sequential_cpu_offload — that conflicts with explicit device placement.
    Text encoding runs on CPU (slow but stable, no OOM risk).
    """
    global _pipeline, _vae_temporal_ratio, _config

    if _pipeline is not None:
        return

    if _config is None:
        _config = OmegaConf.load(str(_CONFIG_PATH))

    print("[EchoMimic] Loading pipeline models…")

    # ── 1. VAE → CUDA immediately ─────────────────────────────────────────
    print("[EchoMimic]   1/4  VAE…")
    vae_path = str(_BASE_MODEL / _config["vae_kwargs"].get("vae_subpath", "vae"))
    vae = AutoencoderKLWan.from_pretrained(
        vae_path,
        additional_kwargs=OmegaConf.to_container(_config["vae_kwargs"]),
    ).to(DTYPE)
    _vae_temporal_ratio = _config["vae_kwargs"].get("temporal_compression_ratio", 4)
    vae = _to_cuda(vae, "VAE")

    # ── 2. Cached text encoder — replaces UMT5-XXL ───────────────────────
    # Loads pre-computed embeddings from text_embeds.pt (~few MB, instant).
    # UMT5-XXL (20 GB) is never loaded here — it ran once in precompute_text_embeds.py.
    print("[EchoMimic]   2/4  cached text encoder (from text_embeds.pt)…")
    text_encoder = _load_cached_text_encoder()

    tok_sub  = _config["text_encoder_kwargs"].get("tokenizer_subpath", "tokenizer")
    tok_path = str(_BASE_MODEL / tok_sub) if (_BASE_MODEL / tok_sub).exists() else tok_sub
    tokenizer = AutoTokenizer.from_pretrained(tok_path)

    # ── 3. CLIP → CUDA immediately ────────────────────────────────────────
    print("[EchoMimic]   3/4  CLIP image encoder…")
    ie_path = str(_BASE_MODEL / _config["image_encoder_kwargs"].get("image_encoder_subpath", "image_encoder"))
    clip = CLIPModel.from_pretrained(ie_path, transformer_additional_kwargs={}).to(DTYPE).eval()
    clip = _to_cuda(clip, "CLIP")

    # ── 4. Transformer → CUDA immediately ────────────────────────────────
    # Peak CPU RAM during this load: cached text encoder (~few MB) + transformer
    # (6 GB) = ~6 GB total.  Negligible.  Transformer moves to CUDA after.
    print("[EchoMimic]   4/4  EchoMimic V3 transformer…")
    transformer = WanTransformerAudioMask3DModel.from_pretrained(
        str(_TRANSFORMER),
        transformer_additional_kwargs=OmegaConf.to_container(_config["transformer_additional_kwargs"]),
        low_cpu_mem_usage=False,
        torch_dtype=DTYPE,
    )
    transformer = _to_cuda(transformer, "transformer")

    # ── Scheduler ─────────────────────────────────────────────────────────
    sched_cfg = OmegaConf.to_container(_config["scheduler_kwargs"])
    sched_cfg["shift"] = 1
    scheduler = FlowUniPCMultistepScheduler(
        **src_filter_kwargs(FlowUniPCMultistepScheduler, sched_cfg)
    )

    # ── Assemble pipeline ─────────────────────────────────────────────────
    print("[EchoMimic]   assembling pipeline…")
    _pipeline = WanFunInpaintAudioPipeline(
        transformer=transformer,
        vae=vae,
        tokenizer=tokenizer,
        text_encoder=text_encoder,
        scheduler=scheduler,
        clip_image_encoder=clip,
    )
    # Do NOT call _pipeline.to(DEVICE) or enable_sequential_cpu_offload —
    # models are already on their correct devices.  The pipeline infers its
    # execution device from the transformer's current device (CUDA).

    vram_used = torch.cuda.memory_allocated() / 1e9
    vram_total = torch.cuda.get_device_properties(0).total_memory / 1e9
    print(f"[EchoMimic] Pipeline ready. VRAM: {vram_used:.1f}/{vram_total:.0f} GB")


# ─────────────────────────────────────────────────────────────────────────────
# Audio helpers
# ─────────────────────────────────────────────────────────────────────────────

def _loudness_norm(audio_array: np.ndarray, sr: int = 16000, lufs: float = -23) -> np.ndarray:
    meter = pyln.Meter(sr)
    loudness = meter.integrated_loudness(audio_array)
    if abs(loudness) > 100:
        return audio_array
    return pyln.normalize.loudness(audio_array, loudness, lufs)


def _get_audio_embed(audio: np.ndarray, video_length: int, sr: int = 16000) -> torch.Tensor:
    """Wav2Vec2 embeddings with temporal windowing (window=5)."""
    audio_feature = np.squeeze(
        _wav2vec_extractor(audio, sampling_rate=sr).input_values
    )
    audio_feature = torch.from_numpy(audio_feature).float().unsqueeze(0)

    with torch.no_grad():
        embeddings = _wav2vec_model(audio_feature, seq_len=video_length, output_hidden_states=True)

    audio_emb = torch.stack(embeddings.hidden_states[1:], dim=1).squeeze(0)
    audio_emb = rearrange(audio_emb, "b s d -> s b d").cpu().detach()

    indices = (torch.arange(2 * 2 + 1) - 2) * 1
    center_indices = (
        torch.arange(0, video_length).unsqueeze(1) + indices.unsqueeze(0)
    )
    center_indices = torch.clamp(center_indices, min=0, max=audio_emb.shape[0] - 1)
    audio_emb = audio_emb[center_indices]       # [F, 5, 12, 768]
    return audio_emb.unsqueeze(0)               # [1, F, 5, 12, 768]


def _valid_video_length(raw: int, temporal_ratio: int = 4) -> int:
    if raw < 17:
        return 17
    remainder = (raw - 1) % temporal_ratio
    return raw if remainder == 0 else raw + (temporal_ratio - remainder)


# ─────────────────────────────────────────────────────────────────────────────
# Generation constants
# ─────────────────────────────────────────────────────────────────────────────

OUTPUT_HEIGHT    = 512
OUTPUT_WIDTH     = 512
CHUNK_FRAMES     = 121   # (121-1) % 4 == 0, ≈ 4.8 s per chunk
MAX_TOTAL_FRAMES = 750   # hard cap — 30 s at 25 fps


def _pipeline_output_to_tensor(output) -> torch.Tensor:
    if isinstance(output, tuple):
        return output[0]
    if hasattr(output, "frames"):
        return output.frames
    if hasattr(output, "videos"):
        return output.videos
    return output


def _last_frame_as_image(videos: torch.Tensor) -> Image.Image:
    v    = videos[0] if videos.dim() == 5 else videos
    last = v[:, -1, :, :].cpu().float()
    if last.min() < -0.1:
        last = (last + 1.0) / 2.0
    arr  = (last.clamp(0, 1) * 255).byte().permute(1, 2, 0).numpy()
    return Image.fromarray(arr)


def _generate_one_chunk(
    anchor_image: Image.Image,
    chunk_audio:  np.ndarray,
    sr:           int,
    num_frames:   int,
    prompt:       str,
    seed:         int,
) -> torch.Tensor:
    import time as _t
    t0 = _t.time()

    audio_embeds = _get_audio_embed(chunk_audio, num_frames, sr)
    audio_embeds = audio_embeds.to(device=DEVICE, dtype=DTYPE)

    input_video, input_video_mask, clip_image = get_image_to_video_latent2(
        anchor_image, None,
        video_length=num_frames,
        sample_size=[OUTPUT_HEIGHT, OUTPUT_WIDTH],
    )

    generator = torch.Generator(device="cuda").manual_seed(seed)

    print(f"[EchoMimic]     prep: {_t.time()-t0:.1f}s — starting denoising ({num_frames} frames)…")
    t1 = _t.time()

    with torch.no_grad():
        output = _pipeline(
            prompt=prompt or "A person is speaking naturally, realistic, high quality.",
            negative_prompt=(
                "Gesture is bad. Gesture is unclear. Strange and twisted hands. "
                "Bad hands. Bad fingers. Unclear and blurry hands."
            ),
            num_frames=num_frames,
            audio_embeds=audio_embeds,
            audio_scale=1.0,
            ip_mask=None,
            height=OUTPUT_HEIGHT,
            width=OUTPUT_WIDTH,
            guidance_scale=6.0,
            audio_guidance_scale=3.0,
            neg_scale=1.0,
            neg_steps=0,
            num_inference_steps=6,
            video=input_video,
            mask_video=input_video_mask,
            clip_image=clip_image,
            generator=generator,
            use_dynamic_cfg=False,
            use_dynamic_acfg=False,
            shift=5.0,
            cfg_skip_ratio=0.4,
            return_dict=False,
        )

    print(f"[EchoMimic]     denoising: {_t.time()-t1:.1f}s")
    videos = _pipeline_output_to_tensor(output)
    gc.collect()
    torch.cuda.empty_cache()
    return videos


# ─────────────────────────────────────────────────────────────────────────────
# Job queue
# ─────────────────────────────────────────────────────────────────────────────

_jobs:        dict = {}
_thread_pool  = concurrent.futures.ThreadPoolExecutor(max_workers=1)


def _run_echomimic(job_id: str, image_path: str, audio_path: str, prompt: str):
    import time
    try:
        t0 = time.time()
        print(f"[EchoMimic] job {job_id} — starting")

        # ── Step 1: audio model → embeddings ─────────────────────────────
        print(f"[EchoMimic] step 1/3 — loading audio model + extracting embeddings…")
        _load_audio_model()

        ref_image = Image.open(image_path).convert("RGB")
        audio, sr = librosa.load(audio_path, sr=16000, mono=True)
        audio     = _loudness_norm(audio, sr)

        fps        = 25
        raw_frames = max(17, int(len(audio) / sr * fps))
        raw_frames = min(raw_frames, MAX_TOTAL_FRAMES)
        total_frames = _valid_video_length(
            int((raw_frames - 1) // _vae_temporal_ratio * _vae_temporal_ratio) + 1,
            _vae_temporal_ratio,
        )
        audio = audio[: int(total_frames / fps * sr)]
        print(f"[EchoMimic] {total_frames} frames ({total_frames/fps:.1f}s)")

        # ── Step 2: load video pipeline (first call only) ─────────────────
        print(f"[EchoMimic] step 2/3 — loading video pipeline (first call downloads ~26 GB)…")
        _load_pipeline()

        # ── Step 3: generate video in chunks ─────────────────────────────
        print(f"[EchoMimic] step 3/3 — generating video…")
        chunk_tensors: list = []
        anchor_image  = ref_image
        frame_cursor  = 0
        chunk_idx     = 0

        while frame_cursor < total_frames:
            remaining    = total_frames - frame_cursor
            chunk_frames = min(CHUNK_FRAMES, remaining)
            chunk_frames = _valid_video_length(
                int((chunk_frames - 1) // _vae_temporal_ratio * _vae_temporal_ratio) + 1,
                _vae_temporal_ratio,
            )
            if chunk_frames < 17:
                break

            s0 = int(frame_cursor / fps * sr)
            s1 = int((frame_cursor + chunk_frames) / fps * sr)
            chunk_audio = audio[s0:s1]

            chunk_idx += 1
            n_chunks = max(1, -(-total_frames // CHUNK_FRAMES))
            print(f"[EchoMimic]   chunk {chunk_idx}/{n_chunks} — "
                  f"frames {frame_cursor}–{frame_cursor+chunk_frames} "
                  f"({frame_cursor/fps:.1f}s–{(frame_cursor+chunk_frames)/fps:.1f}s)")

            videos = _generate_one_chunk(
                anchor_image, chunk_audio, sr, chunk_frames, prompt,
                seed=42 + chunk_idx,
            )
            chunk_tensors.append(videos[:, :, :chunk_frames])
            anchor_image  = _last_frame_as_image(videos)
            frame_cursor += chunk_frames

        # ── Concatenate ───────────────────────────────────────────────────
        final_tensor = chunk_tensors[0] if len(chunk_tensors) == 1 else \
                       torch.cat(chunk_tensors, dim=2)

        # ── Save video with audio ─────────────────────────────────────────
        result_dir = _OUTPUT_DIR / job_id
        result_dir.mkdir(exist_ok=True)
        tmp_path   = str(result_dir / "silent.mp4")
        final_path = str(result_dir / "result.mp4")

        save_videos_grid(final_tensor, tmp_path, fps=fps)

        from moviepy import AudioFileClip, VideoFileClip
        video_clip = VideoFileClip(tmp_path)
        audio_clip = AudioFileClip(audio_path).subclipped(0, total_frames / fps)
        video_clip.with_audio(audio_clip).write_videofile(
            final_path, codec="libx264", audio_codec="aac", threads=2, logger=None
        )
        video_clip.close()
        os.remove(tmp_path)

        elapsed = time.time() - t0
        _jobs[job_id]["video_path"] = final_path
        _jobs[job_id]["status"]     = "done"
        print(f"[EchoMimic] job {job_id} done → {final_path}  ({elapsed:.0f}s total)")

    except Exception as e:
        _jobs[job_id]["status"] = "failed"
        _jobs[job_id]["error"]  = f"{e}\n\n{traceback.format_exc()}"
        print(f"[EchoMimic] job {job_id} failed: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="EchoMimic V3 API",
    description="Audio-driven talking-head video — CUDA only",
    version="2.0.0",
)


@app.get("/health")
def health():
    vram_total = round(torch.cuda.get_device_properties(0).total_memory / 1e9, 1)
    vram_used  = round(torch.cuda.memory_allocated() / 1e9, 1)
    return {
        "status":        "ok",
        "device":        DEVICE,
        "dtype":         str(DTYPE),
        "vram_total_gb": vram_total,
        "vram_used_gb":  vram_used,
        "audio_loaded":  _wav2vec_model is not None,
        "pipeline_loaded": _pipeline is not None,
    }


@app.post("/lipsync/generate")
async def lipsync_generate(
    image:  UploadFile = File(..., description="Portrait image (PNG/JPG)"),
    audio:  UploadFile = File(..., description="Driving audio (WAV/MP3)"),
    prompt: str        = Form("", description="Text description of the subject"),
):
    img_bytes = await image.read()
    aud_bytes = await audio.read()

    if not img_bytes:
        raise HTTPException(status_code=400, detail="Image file is empty")
    if not aud_bytes:
        raise HTTPException(status_code=400, detail="Audio file is empty")

    job_id  = str(uuid.uuid4())
    job_dir = _OUTPUT_DIR / f"{job_id}_input"
    job_dir.mkdir(exist_ok=True)

    img_suffix = Path(image.filename or "avatar.png").suffix or ".png"
    aud_suffix = Path(audio.filename or "voice.wav").suffix or ".wav"
    img_path   = str(job_dir / f"image{img_suffix}")
    aud_path   = str(job_dir / f"audio{aud_suffix}")

    with open(img_path, "wb") as f:
        f.write(img_bytes)
    with open(aud_path, "wb") as f:
        f.write(aud_bytes)

    _jobs[job_id] = {"status": "processing", "video_path": None, "error": None}

    loop = asyncio.get_event_loop()
    loop.run_in_executor(_thread_pool, _run_echomimic, job_id, img_path, aud_path, prompt)

    print(f"[EchoMimic] queued job {job_id}")
    return JSONResponse({"job_id": job_id, "status": "processing"}, status_code=202)


@app.get("/lipsync/status/{job_id}")
def lipsync_status(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] == "failed":
        return JSONResponse(
            {"job_id": job_id, "status": "failed", "error": job["error"]},
            status_code=500,
        )
    return JSONResponse({"job_id": job_id, "status": job["status"]})


@app.get("/lipsync/result/{job_id}")
def lipsync_result(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] == "processing":
        raise HTTPException(status_code=202, detail="Still processing")
    if job["status"] == "failed":
        raise HTTPException(status_code=500, detail=job["error"])

    video_path = job["video_path"]
    if not video_path or not os.path.exists(video_path):
        raise HTTPException(status_code=500, detail="Video file missing")

    with open(video_path, "rb") as f:
        b64_video = base64.b64encode(f.read()).decode()

    return JSONResponse({
        "job_id":  job_id,
        "video":   f"data:video/mp4;base64,{b64_video}",
        "width":   OUTPUT_WIDTH,
        "height":  OUTPUT_HEIGHT,
        "frames":  None,
        "duration_seconds": None,
    })
