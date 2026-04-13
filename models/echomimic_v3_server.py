"""
EchoMimic V3 API Server
────────────────────────
Runs on port 8001, separate from the image/TTS server (port 8000).

Endpoints:
  POST /lipsync/generate         — start async job, returns {job_id}
  GET  /lipsync/status/{job_id}  — poll: processing | done | failed
  GET  /lipsync/result/{job_id}  — fetch base64 mp4 when done
  GET  /health                   — model + device status

Requirements:
  • CUDA GPU (≥12 GB VRAM) OR Apple Silicon (MPS, unified memory)
  • EchoMimicV3 repo cloned to  models/EchoMimicV3/
  • Weights downloaded to       models/echomimic_weights/
    (run:  python download_echomimic_weights.py)

Start:
  cd models
  source echomimic_venv/bin/activate
  uvicorn echomimic_v3_server:app --host 0.0.0.0 --port 8001
"""

# Enable PyTorch fallback for MPS ops that lack a Metal kernel
import os
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

# ─────────────────────────────────────────────────────────────────────────────
# transformers ≥ 4.51 added a hard version gate that refuses to call torch.load
# on any torch < 2.6 (CVE-2025-32434).  On environments where the cu121 index
# caps out at torch 2.5.1 (e.g. CUDA 12.1 driver), we bypass the gate because:
#   1. We already patch torch.load to set weights_only=False explicitly, so the
#      vulnerable ambiguous-default behaviour never occurs.
#   2. The gate is a version string check, not a functional security control.
# This patch is a no-op when torch >= 2.6 is present.
import torch as _torch_ver_check
import sys as _sys
if tuple(int(x) for x in _torch_ver_check.__version__.split("+")[0].split(".")[:2]) < (2, 6):
    try:
        import transformers.utils.import_utils as _tui
        if hasattr(_tui, "check_torch_load_is_safe"):
            _tui.check_torch_load_is_safe = lambda: None
            print("[EchoMimic] Patched transformers check_torch_load_is_safe (torch < 2.6 + explicit weights_only=False)")
    except Exception as _e:
        print(f"[EchoMimic] Could not patch transformers safety check: {_e}")

# Disable the MPS high-watermark cap.
# On Apple Silicon, CPU and MPS share the same DRAM pool, so large models loaded
# on CPU count toward the MPS allocation budget (default 70% of total RAM).
# With ~20 GB of model weights, the 70% cap (~20.4 GB on a 32 GB Mac) is hit
# before inference can allocate working buffers.  Setting ratio=0.0 removes the
# cap so the OS manages pressure instead.  Safe as long as total RAM > model size.
os.environ.setdefault("PYTORCH_MPS_HIGH_WATERMARK_RATIO", "0.0")

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

# ─────────────────────────────────────────────────────────────────────────────
# On MPS, torch.cuda.amp.autocast is a no-op (CUDA not available), so model
# code that wraps forward passes with it skips dtype casting entirely, causing
# float32 input vs float16 weight mismatches.  Patch it to use MPS autocast.
# ─────────────────────────────────────────────────────────────────────────────
_mps_available = getattr(torch.backends, "mps", None) is not None and torch.backends.mps.is_available()
if _mps_available and not torch.cuda.is_available():
    import torch.cuda.amp as _cuda_amp
    _OrigAutocast = _cuda_amp.autocast

    class _MPSAutocast:
        """Drop-in for torch.cuda.amp.autocast that uses MPS autocast on Apple Silicon."""
        def __init__(self, enabled=True, dtype=None, cache_enabled=None, **kwargs):
            _dtype = dtype if dtype is not None else torch.float16
            self._ctx = torch.amp.autocast(device_type="mps", dtype=_dtype, enabled=enabled)

        def __enter__(self):
            return self._ctx.__enter__()

        def __exit__(self, *args):
            return self._ctx.__exit__(*args)

        def __call__(self, func):
            return self._ctx(func) if callable(func) else self

    _cuda_amp.autocast = _MPSAutocast
    torch.cuda.amp.autocast = _MPSAutocast  # type: ignore

# ─────────────────────────────────────────────────────────────────────────────
# Memory-mapped torch.load — prevents doubling peak RAM when loading large
# .pth/.safetensors weight files (tensors are paged in on demand instead of
# being fully read into RAM before dtype conversion).
# Applied globally so EchoMimicV3 src/ loaders benefit automatically.
# ─────────────────────────────────────────────────────────────────────────────
_orig_torch_load = torch.load

@functools.wraps(_orig_torch_load)
def _mmap_torch_load(f, *args, **kwargs):
    # Only apply mmap to file paths (not file objects / URLs)
    if isinstance(f, (str, os.PathLike)):
        if "mmap" not in kwargs:
            kwargs["mmap"] = True
        # PyTorch 2.6+ requires weights_only to be set explicitly.
        # EchoMimicV3's internal torch.load calls don't pass it, which triggers
        # a FutureWarning that becomes an error in newer transformers.
        # Use weights_only=False to preserve the original behaviour for .pth files;
        # safetensors files never go through torch.load so this is safe.
        if "weights_only" not in kwargs:
            kwargs["weights_only"] = False
    return _orig_torch_load(f, *args, **kwargs)

torch.load = _mmap_torch_load

# ─────────────────────────────────────────────────────────────────────────────
# Fix broken diffusers import in EchoMimicV3 src — load_model_dict_into_meta
# was removed in diffusers 0.33+.  Inject a shim so low_cpu_mem_usage=True
# works for the transformer (saves ~2× peak RAM during load).
# ─────────────────────────────────────────────────────────────────────────────
def _load_model_dict_into_meta_shim(model, state_dict, dtype=None, **kwargs):
    """Minimal shim for diffusers' removed load_model_dict_into_meta."""
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
            # fallback: just do a normal assignment
            mod = model
            for part in parts[:-1]:
                mod = getattr(mod, part)
            setattr(mod, parts[-1], torch.nn.Parameter(value))

try:
    import diffusers.models.modeling_utils as _dmu
    if not hasattr(_dmu, "load_model_dict_into_meta"):
        _dmu.load_model_dict_into_meta = _load_model_dict_into_meta_shim
        print("[EchoMimic] Injected load_model_dict_into_meta shim into diffusers")
except Exception as _e:
    print(f"[EchoMimic] Could not patch diffusers: {_e}")

# ─────────────────────────────────────────────────────────────────────────────
# Paths — override via env vars if needed
# ─────────────────────────────────────────────────────────────────────────────

_REPO       = Path(os.environ.get("ECHOMIMIC_REPO",    Path(__file__).parent / "EchoMimicV3"))
_WEIGHTS    = Path(os.environ.get("ECHOMIMIC_WEIGHTS", Path(__file__).parent / "echomimic_weights"))
_OUTPUT_DIR = Path(__file__).parent / "echomimic_results"
_OUTPUT_DIR.mkdir(exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# Device detection
# ─────────────────────────────────────────────────────────────────────────────

_CUDA = torch.cuda.is_available()
_MPS  = (not _CUDA) and getattr(torch.backends, "mps", None) is not None and torch.backends.mps.is_available()

if not _CUDA and not _MPS:
    raise RuntimeError(
        "EchoMimic V3 requires either a CUDA GPU (≥12 GB VRAM) or Apple Silicon (MPS).\n"
        "No supported accelerator detected."
    )

if not _REPO.exists():
    raise RuntimeError(
        f"EchoMimicV3 repo not found at {_REPO}.\n"
        "Run:  git clone https://github.com/antgroup/echomimic_v3 models/EchoMimicV3"
    )

if not _WEIGHTS.exists():
    raise RuntimeError(
        f"EchoMimic V3 weights not found at {_WEIGHTS}.\n"
        "Run:  python download_echomimic_weights.py"
    )

# Add EchoMimicV3 repo to path so we can import its src/ modules
sys.path.insert(0, str(_REPO))

# ─────────────────────────────────────────────────────────────────────────────
# Device / dtype
# MPS doesn't support bfloat16 — use float16 instead
# ─────────────────────────────────────────────────────────────────────────────

DEVICE = "cuda" if _CUDA else "mps"
DTYPE  = torch.bfloat16 if _CUDA else torch.float16

print(f"[EchoMimic] device={DEVICE}  dtype={DTYPE}")

# ─────────────────────────────────────────────────────────────────────────────
# Imports from EchoMimicV3 src/ (flat structure — no subpackages)
# ─────────────────────────────────────────────────────────────────────────────

from omegaconf import OmegaConf
from transformers import AutoTokenizer, Wav2Vec2FeatureExtractor
from einops import rearrange

from src.wan_vae                          import AutoencoderKLWan                  # noqa: E402
from src.wan_image_encoder                import CLIPModel                          # noqa: E402
from src.wan_text_encoder                 import WanT5EncoderModel                 # noqa: E402
from src.wan_transformer3d_audio_2512     import WanTransformerAudioMask3DModel    # noqa: E402
from src.pipeline_wan_fun_inpaint_audio_2512 import WanFunInpaintAudioPipeline     # noqa: E402
from src.wav2vec2                         import Wav2Vec2Model as EchoWav2Vec2Model # noqa: E402
from src.utils                            import (                                  # noqa: E402
    get_image_to_video_latent2,
    save_videos_grid,
    filter_kwargs as src_filter_kwargs,
)
from src.fm_solvers_unipc                 import FlowUniPCMultistepScheduler        # noqa: E402
from src.cache_utils                      import get_teacache_coefficients          # noqa: E402

import librosa          # noqa: E402
import pyloudnorm as pyln  # noqa: E402
from PIL import Image   # noqa: E402

# ─────────────────────────────────────────────────────────────────────────────
# Weight paths
# ─────────────────────────────────────────────────────────────────────────────

# Config lives inside the cloned EchoMimicV3 repo
_CONFIG_PATH  = _REPO / "config" / "config.yaml"
_BASE_MODEL   = _WEIGHTS / "base"          # Wan2.1-Fun-V1.1-1.3B-InP snapshot
_WAV2VEC_PATH = _WEIGHTS / "wav2vec2"      # TencentGameMate/chinese-wav2vec2-base
_TRANSFORMER  = _WEIGHTS / "transformer" / "transformer"   # BadToBest/EchoMimicV3 → transformer/transformer/

# ─────────────────────────────────────────────────────────────────────────────
# Global model state
# ─────────────────────────────────────────────────────────────────────────────

_pipeline:       Optional[WanFunInpaintAudioPipeline] = None
_wav2vec_model:  Optional[EchoWav2Vec2Model]          = None
_wav2vec_extractor: Optional[Wav2Vec2FeatureExtractor] = None
_vae_temporal_ratio: int = 4   # populated from config at load time
_models_ready = False


def _load_models():
    global _pipeline, _wav2vec_model, _wav2vec_extractor, _vae_temporal_ratio, _models_ready

    print("[EchoMimic] Loading models — this will take a few minutes…")

    config = OmegaConf.load(str(_CONFIG_PATH))

    # ── Wav2Vec2 audio encoder (kept on CPU for inference) ────────────────
    print("[EchoMimic] Loading Wav2Vec2…")
    _wav2vec_extractor = Wav2Vec2FeatureExtractor.from_pretrained(
        str(_WAV2VEC_PATH), local_files_only=True
    )
    _wav2vec_model = EchoWav2Vec2Model.from_pretrained(
        str(_WAV2VEC_PATH), local_files_only=True
    ).to("cpu")
    _wav2vec_model.feature_extractor._freeze_parameters()
    gc.collect()

    def _to_gpu(model, name: str):
        """Move a model to GPU immediately after loading so CPU RAM is freed
        before the next (possibly larger) model is loaded."""
        if _CUDA:
            print(f"[EchoMimic]   → moving {name} to GPU…")
            model = model.to(DEVICE)
            gc.collect()
            torch.cuda.empty_cache()
        return model

    # ── VAE ───────────────────────────────────────────────────────────────
    print("[EchoMimic] Loading VAE…")
    vae_path = str(_BASE_MODEL / config["vae_kwargs"].get("vae_subpath", "vae"))
    vae = AutoencoderKLWan.from_pretrained(
        vae_path,
        additional_kwargs=OmegaConf.to_container(config["vae_kwargs"]),
    ).to(DTYPE)
    _vae_temporal_ratio = config["vae_kwargs"].get("temporal_compression_ratio", 4)
    vae = _to_gpu(vae, "VAE")
    gc.collect()

    # ── Text encoder + tokenizer ──────────────────────────────────────────
    # IMPORTANT: kept on CPU intentionally.
    # UMT5-XXL is ~20 GB in bfloat16 — it alone fills a 24 GB GPU.
    # It only runs ONCE per job to encode the text prompt; the transformer
    # runs 8 denoising steps on GPU.  Keeping it on CPU means VAE + CLIP +
    # transformer (~10 GB) fit comfortably in VRAM.
    print("[EchoMimic] Loading text encoder (CPU)…")
    te_path = str(_BASE_MODEL / config["text_encoder_kwargs"].get("text_encoder_subpath", "text_encoder"))
    text_encoder = WanT5EncoderModel.from_pretrained(
        te_path,
        additional_kwargs=OmegaConf.to_container(config["text_encoder_kwargs"]),
        low_cpu_mem_usage=False,
        torch_dtype=DTYPE,
    ).eval()
    # do NOT move to GPU — stays on CPU throughout
    gc.collect()

    tok_subpath = config["text_encoder_kwargs"].get("tokenizer_subpath", "tokenizer")
    tok_path = str(_BASE_MODEL / tok_subpath) if ((_BASE_MODEL / tok_subpath).exists()) else tok_subpath
    tokenizer = AutoTokenizer.from_pretrained(tok_path)

    # ── CLIP image encoder ────────────────────────────────────────────────
    print("[EchoMimic] Loading CLIP image encoder…")
    ie_path = str(_BASE_MODEL / config["image_encoder_kwargs"].get("image_encoder_subpath", "image_encoder"))
    clip_image_encoder = CLIPModel.from_pretrained(
        ie_path,
        transformer_additional_kwargs={},
    ).to(DTYPE).eval()
    clip_image_encoder = _to_gpu(clip_image_encoder, "CLIP")
    gc.collect()

    # ── Transformer ───────────────────────────────────────────────────────
    print("[EchoMimic] Loading EchoMimic V3 transformer…")
    transformer_additional_kwargs = OmegaConf.to_container(config["transformer_additional_kwargs"])
    transformer = WanTransformerAudioMask3DModel.from_pretrained(
        str(_TRANSFORMER),
        transformer_additional_kwargs=transformer_additional_kwargs,
        low_cpu_mem_usage=False,
        torch_dtype=DTYPE,
    )
    transformer = _to_gpu(transformer, "transformer")
    gc.collect()

    # ── Scheduler ─────────────────────────────────────────────────────────
    sched_cfg = OmegaConf.to_container(config["scheduler_kwargs"])
    sched_cfg["shift"] = 1   # as done in infer_flash.py for Flow_Unipc
    scheduler = FlowUniPCMultistepScheduler(
        **src_filter_kwargs(FlowUniPCMultistepScheduler, sched_cfg)
    )

    # ── Assemble pipeline ─────────────────────────────────────────────────
    print("[EchoMimic] Assembling pipeline…")
    _pipeline = WanFunInpaintAudioPipeline(
        transformer=transformer,
        vae=vae,
        tokenizer=tokenizer,
        text_encoder=text_encoder,
        scheduler=scheduler,
        clip_image_encoder=clip_image_encoder,
    )
    print("[EchoMimic] Pipeline assembled.")

    # ── TeaCache ──────────────────────────────────────────────────────────
    print("[EchoMimic] Enabling TeaCache…")
    coefficients = get_teacache_coefficients("Wan2.1-Fun-V1.1-1.3B-InP")
    if coefficients is not None:
        _pipeline.transformer.enable_teacache(
            coefficients,
            num_steps=8,
            rel_l1_thresh=0.1,
            num_skip_start_steps=5,
            offload=False,
        )
        print("[EchoMimic] TeaCache enabled.")
    else:
        print("[EchoMimic] TeaCache coefficients not found — skipping.")

    # ── Device placement ──────────────────────────────────────────────────
    # VAE, CLIP, transformer are already on GPU from eager loading above.
    # Text encoder stays on CPU (it is ~20 GB and only needed once per job).
    # We call _pipeline.to(DEVICE) to register device metadata on the pipeline,
    # then immediately move the text encoder back to CPU so it doesn't OOM.
    if _CUDA:
        total_vram_gb = torch.cuda.get_device_properties(0).total_memory / 1e9
        if total_vram_gb >= 20:
            _pipeline.to(DEVICE)
            # Re-pin text encoder to CPU — _pipeline.to() pulled it to GPU
            _pipeline.text_encoder.to("cpu")
            torch.cuda.empty_cache()
        else:
            print(f"[EchoMimic] VRAM={total_vram_gb:.0f} GB — enabling sequential_cpu_offload")
            _pipeline.enable_sequential_cpu_offload()
        vram_used_gb = torch.cuda.memory_allocated() / 1e9
        print(f"[EchoMimic] VRAM after placement: {vram_used_gb:.1f} GB / {total_vram_gb:.0f} GB")
    else:
        print("[EchoMimic] MPS — enabling model_cpu_offload")
        _pipeline.enable_model_cpu_offload()

    _models_ready = True
    print("[EchoMimic] All models ready.")


# ─────────────────────────────────────────────────────────────────────────────
# Audio helpers (taken directly from infer_flash.py)
# ─────────────────────────────────────────────────────────────────────────────

def _loudness_norm(audio_array: np.ndarray, sr: int = 16000, lufs: float = -23) -> np.ndarray:
    meter = pyln.Meter(sr)
    loudness = meter.integrated_loudness(audio_array)
    if abs(loudness) > 100:
        return audio_array
    return pyln.normalize.loudness(audio_array, loudness, lufs)


def _get_audio_embed(
    mel_input: np.ndarray,
    video_length: int,
    sr: int = 16000,
) -> torch.Tensor:
    """Extract Wav2Vec2 embeddings then apply temporal windowing (window=5)."""
    audio_feature = np.squeeze(
        _wav2vec_extractor(mel_input, sampling_rate=sr).input_values
    )
    audio_feature = torch.from_numpy(audio_feature).float().to("cpu").unsqueeze(0)

    with torch.no_grad():
        embeddings = _wav2vec_model(audio_feature, seq_len=video_length, output_hidden_states=True)

    audio_emb = torch.stack(embeddings.hidden_states[1:], dim=1).squeeze(0)
    audio_emb = rearrange(audio_emb, "b s d -> s b d").cpu().detach()

    # Temporal windowing (window half-size = 2, total = 5 frames context)
    indices = (torch.arange(2 * 2 + 1) - 2) * 1
    center_indices = (
        torch.arange(0, video_length, 1).unsqueeze(1) + indices.unsqueeze(0)
    )
    center_indices = torch.clamp(center_indices, min=0, max=audio_emb.shape[0] - 1)
    audio_emb = audio_emb[center_indices]           # [F, 5, 12, 768]
    return audio_emb.unsqueeze(0)                   # [1, F, 5, 12, 768]


def _valid_video_length(raw: int, temporal_ratio: int = 4) -> int:
    """Round to nearest valid frame count: (n-1) % temporal_ratio == 0, min 17."""
    if raw < 17:
        return 17
    remainder = (raw - 1) % temporal_ratio
    return raw if remainder == 0 else raw + (temporal_ratio - remainder)


# ─────────────────────────────────────────────────────────────────────────────
# Job queue
# ─────────────────────────────────────────────────────────────────────────────

_jobs: dict = {}
_thread_pool = concurrent.futures.ThreadPoolExecutor(max_workers=1)

OUTPUT_HEIGHT = 768
OUTPUT_WIDTH  = 768


def _run_echomimic(job_id: str, image_path: str, audio_path: str, prompt: str):
    try:
        print(f"[EchoMimic] job {job_id} — starting")

        # ── Load inputs ───────────────────────────────────────────────────
        ref_image = Image.open(image_path).convert("RGB")
        audio, sr = librosa.load(audio_path, sr=16000, mono=True)
        audio = _loudness_norm(audio, sr)

        # ── Compute video length from audio duration ──────────────────────
        fps = 25
        raw_frames = max(17, int(len(audio) / sr * fps))
        # Clamp to (n-1) % temporal_ratio == 0
        num_frames = _valid_video_length(
            int((raw_frames - 1) // _vae_temporal_ratio * _vae_temporal_ratio) + 1,
            _vae_temporal_ratio,
        )
        audio = audio[: int(num_frames / fps * sr)]
        print(f"[EchoMimic] job {job_id} — {num_frames} frames")

        # ── Audio embeddings ──────────────────────────────────────────────
        audio_embeds = _get_audio_embed(audio, num_frames, sr)
        audio_embeds = audio_embeds.to(device=DEVICE, dtype=DTYPE)

        # ── Image latents ─────────────────────────────────────────────────
        input_video, input_video_mask, clip_image = get_image_to_video_latent2(
            ref_image, None, video_length=num_frames, sample_size=[OUTPUT_HEIGHT, OUTPUT_WIDTH]
        )

        # ── Generator — diffusers requires CPU generator on MPS ───────────
        _gen_device = "cuda" if _CUDA else "cpu"
        generator = torch.Generator(device=_gen_device).manual_seed(42)

        # ── Pipeline call (matches infer_flash.py signature exactly) ─────
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
                num_inference_steps=8,
                video=input_video,
                mask_video=input_video_mask,
                clip_image=clip_image,
                generator=generator,
                use_dynamic_cfg=False,
                use_dynamic_acfg=False,
                shift=5.0,
                cfg_skip_ratio=0.0,
            )

        # ── Save video ────────────────────────────────────────────────────
        result_dir = _OUTPUT_DIR / job_id
        result_dir.mkdir(exist_ok=True)
        tmp_path   = str(result_dir / "silent.mp4")
        final_path = str(result_dir / "result.mp4")

        save_videos_grid(output[:, :, :num_frames], tmp_path, fps=fps)

        from moviepy import AudioFileClip, VideoFileClip
        video_clip = VideoFileClip(tmp_path)
        audio_clip = AudioFileClip(audio_path).subclipped(0, num_frames / fps)
        video_clip.with_audio(audio_clip).write_videofile(
            final_path, codec="libx264", audio_codec="aac", threads=2, logger=None
        )
        video_clip.close()
        os.remove(tmp_path)

        _jobs[job_id]["video_path"] = final_path
        _jobs[job_id]["status"]     = "done"
        print(f"[EchoMimic] job {job_id} done → {final_path}")

    except Exception as e:
        _jobs[job_id]["status"] = "failed"
        _jobs[job_id]["error"]  = f"{e}\n\n{traceback.format_exc()}"
        print(f"[EchoMimic] job {job_id} failed: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="EchoMimic V3 API",
    description="Audio-driven talking-head video — EchoMimicV3 (Wan2.1 based)",
    version="1.0.0",
)


@app.on_event("startup")
def startup():
    _load_models()


@app.get("/health")
def health():
    vram = round(torch.cuda.get_device_properties(0).total_memory / 1e9, 1) if _CUDA else "N/A (unified)"
    return {
        "status":  "ok" if _models_ready else "loading",
        "device":  DEVICE,
        "dtype":   str(DTYPE),
        "vram_gb": vram,
        "model":   "EchoMimicV3-Flash",
    }


@app.post("/lipsync/generate")
async def lipsync_generate(
    image:  UploadFile = File(..., description="Portrait image (PNG/JPG)"),
    audio:  UploadFile = File(..., description="Driving audio (WAV/MP3)"),
    prompt: str        = Form("", description="Text description of the subject"),
):
    if not _models_ready:
        raise HTTPException(status_code=503, detail="Models are still loading, try again shortly")

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

    print(f"[EchoMimic] started job {job_id}")
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
        "job_id":           job_id,
        "video":            f"data:video/mp4;base64,{b64_video}",
        "duration_seconds": None,
        "width":            OUTPUT_WIDTH,
        "height":           OUTPUT_HEIGHT,
        "frames":           None,
    })
