"""
Unified AI Models API  (Mac-friendly edition)
──────────────────────────────────────────────
Endpoints:
  POST /image/generate    — SDXL-Turbo           (text → image, no auth needed)
  POST /tts/generate      — Kokoro TTS           (text → speech, Apache 2.0)
  POST /lipsync/generate  — SadTalker            (image + audio → lip-sync video, MIT)

  GET  /health            — status of all three models

Start (local):
    cd models
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload
"""

import io
import os
import sys
import base64
import tempfile
import uuid
import asyncio
import concurrent.futures
from enum import Enum

# Fix macOS SSL certificate verification issue
import certifi
os.environ.setdefault("SSL_CERT_FILE", certifi.where())
os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())

# Allow unsupported MPS ops to fall back to CPU instead of stalling
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")
# Disable MPS memory limit so the model can use all available GPU memory
os.environ.setdefault("PYTORCH_MPS_HIGH_WATERMARK_RATIO", "1.7")
from pathlib import Path
from typing import Optional

import numpy as np
import torch
import soundfile as sf

# Patch: basicsr<=1.4.2 imports a module removed in torchvision>=0.17
# This must run before any basicsr/facexlib/gfpgan import
try:
    import torchvision.transforms.functional_tensor  # noqa: F401
except ModuleNotFoundError:
    import torchvision.transforms.functional as _F
    import types, sys
    _mod = types.ModuleType("torchvision.transforms.functional_tensor")
    _mod.rgb_to_grayscale = _F.rgb_to_grayscale
    sys.modules["torchvision.transforms.functional_tensor"] = _mod
from PIL import Image
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse

# ─────────────────────────────────────────────────────────────────────────────
# Device selection  (cuda → mps → cpu)
# ─────────────────────────────────────────────────────────────────────────────
device = (
    "cuda" if torch.cuda.is_available()
    else "mps"  if torch.backends.mps.is_available()
    else "cpu"
)
print(f"[startup] Using device: {device}")

app = FastAPI(
    title="AI Models API",
    description="SDXL-Turbo · Kokoro TTS · SadTalker",
    version="2.0.0",
)

# ─────────────────────────────────────────────────────────────────────────────
# 1. SDXL-Turbo  (image generation — no HF auth required)
# ─────────────────────────────────────────────────────────────────────────────
from diffusers import AutoPipelineForText2Image  # noqa: E402

# MPS/CPU need float32; CUDA can use float16
_img_dtype = torch.float16

print("[IMG] Loading SDXL-Turbo…")
img_pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo",
    torch_dtype=_img_dtype,
    variant="fp16",
).to(device)

print("[IMG] Ready.")

# ─────────────────────────────────────────────────────────────────────────────
# 2. Kokoro TTS  (text-to-speech, Apache 2.0, no Triton required)
# ─────────────────────────────────────────────────────────────────────────────
from kokoro import KPipeline  # noqa: E402

_KOKORO_SAMPLE_RATE = 24_000

print("[TTS] Loading Kokoro…")
tts_pipe = KPipeline(lang_code="a")  # 'a' = American English
print("[TTS] Ready.")

# ─────────────────────────────────────────────────────────────────────────────
# 3. SadTalker  (lip-sync video, MIT)
# ─────────────────────────────────────────────────────────────────────────────
_SADTALKER_REPO = Path(
    os.environ.get("SADTALKER_REPO", Path(__file__).parent / "SadTalker")
)
if not _SADTALKER_REPO.exists():
    raise RuntimeError(
        f"SadTalker repo not found at {_SADTALKER_REPO}.\n"
        "Run: git clone https://github.com/OpenTalker/SadTalker\n"
        "Then: cd SadTalker && pip install -r requirements.txt\n"
        "And download checkpoints: bash scripts/download_models.sh\n"
        "Or set SADTALKER_REPO env var to the correct path."
    )

sys.path.insert(0, str(_SADTALKER_REPO))
from src.gradio_demo import SadTalker  # noqa: E402

_SADTALKER_CKPT = Path(
    os.environ.get("SADTALKER_CHECKPOINTS", _SADTALKER_REPO / "checkpoints")
)
_SADTALKER_CONFIG = Path(
    os.environ.get("SADTALKER_CONFIG", _SADTALKER_REPO / "src" / "config")
)

print(f"[LipSync] Loading SadTalker on {device}…")
sad_talker = SadTalker(
    checkpoint_path=str(_SADTALKER_CKPT),
    config_path=str(_SADTALKER_CONFIG),
    lazy_load=True,
)
print("[LipSync] Ready.")

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _to_b64_png(image: Image.Image) -> str:
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def _to_b64_wav(audio: np.ndarray, sample_rate: int) -> str:
    buf = io.BytesIO()
    sf.write(buf, audio, sample_rate, format="WAV")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode()


def _save_upload(upload: UploadFile, suffix: str, tmp_dir: str) -> str:
    path = os.path.join(tmp_dir, f"upload{suffix}")
    with open(path, "wb") as f:
        f.write(upload.file.read())
    return path


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "device": device,
        "models": {
            "image":   "sdxl-turbo",
            "tts":     "kokoro",
            "lipsync": "SadTalker",
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# Route 1 — Image generation  (POST /image/generate)
# ─────────────────────────────────────────────────────────────────────────────

class ImageRequest(BaseModel):
    prompt: str
    width: int = 512
    height: int = 512
    steps: int = 4               # SDXL-Turbo is distilled — 1 step is enough
    guidance_scale: float = 0.0   # SDXL-Turbo works best with guidance_scale=0.0
    seed: Optional[int] = None


@app.post("/image/generate", tags=["Image"])
def image_generate(req: ImageRequest):
    """Generate an image from a text prompt using SDXL-Turbo."""
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt is required")

    generator = (
        torch.Generator(device=device).manual_seed(req.seed) if req.seed is not None else None
    )

    result = img_pipe(
        prompt=req.prompt,
        width=req.width,
        height=req.height,
        num_inference_steps=4,
        guidance_scale=req.guidance_scale,
        generator=generator,
    )

    image = result.images[0]
    return JSONResponse({
        "image":  f"data:image/png;base64,{_to_b64_png(image)}",
        "width":  image.width,
        "height": image.height,
    })


# ─────────────────────────────────────────────────────────────────────────────
# Route 2 — Text-to-speech  (POST /tts/generate)
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/tts/generate", tags=["TTS"])
async def tts_generate(
    text: str = Form(..., description="Text to synthesize"),
    voice: str = Form("af_heart", description="Kokoro voice ID (e.g. af_heart, af_sky, am_adam)"),
    speed: float = Form(1.0, description="Speech speed multiplier"),
):
    """Convert text to speech using Kokoro TTS (Apache 2.0, no Triton required)."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    try:
        audio_chunks = []
        for _, _, audio in tts_pipe(text, voice=voice, speed=speed):
            if audio is not None:
                audio_chunks.append(audio)

        if not audio_chunks:
            raise HTTPException(status_code=500, detail="TTS produced no audio")

        audio_np = np.concatenate(audio_chunks, axis=0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {e}")

    duration = round(len(audio_np) / _KOKORO_SAMPLE_RATE, 2)
    return JSONResponse({
        "audio":            f"data:audio/wav;base64,{_to_b64_wav(audio_np, _KOKORO_SAMPLE_RATE)}",
        "sample_rate":      _KOKORO_SAMPLE_RATE,
        "duration_seconds": duration,
    })


# ─────────────────────────────────────────────────────────────────────────────
# Route 3 — Lip-sync video  (POST /lipsync/generate  →  async job queue)
# ─────────────────────────────────────────────────────────────────────────────

# Persistent output directory — survives across requests
LIPSYNC_OUTPUT_DIR = Path(__file__).parent / "lipsync_results"
LIPSYNC_OUTPUT_DIR.mkdir(exist_ok=True)

# In-memory job store  {job_id: {"status": ..., "video_path": ..., "error": ...}}
_jobs: dict = {}
_thread_pool = concurrent.futures.ThreadPoolExecutor(max_workers=1)


def _run_sadtalker(job_id: str, img_path: str, aud_path: str, still: bool, preprocess: str):
    """Blocking SadTalker call — runs in a thread pool worker."""
    try:
        result_dir = str(LIPSYNC_OUTPUT_DIR / job_id)
        os.makedirs(result_dir, exist_ok=True)
        video_path = sad_talker.test(
            source_image=img_path,
            driven_audio=aud_path,
            preprocess=preprocess,
            still_mode=still,
            use_enhancer=True,
            batch_size=1,
            size=512,
            pose_style=0,
            result_dir=result_dir,
        )
        # Copy video to a stable named path so temp files can be cleaned up
        final_path = str(LIPSYNC_OUTPUT_DIR / f"{job_id}.mp4")
        import shutil
        shutil.copy2(video_path, final_path)
        _jobs[job_id]["video_path"] = final_path
        _jobs[job_id]["status"] = "done"
        print(f"[lipsync] job {job_id} done → {final_path}")
    except Exception as e:
        import traceback
        _jobs[job_id]["status"] = "failed"
        _jobs[job_id]["error"] = f"{e}\n\n{traceback.format_exc()}"
        print(f"[lipsync] job {job_id} failed: {e}")


@app.post("/lipsync/generate", tags=["LipSync"])
async def lipsync_generate(
    image: UploadFile = File(..., description="Reference face image (PNG/JPG)"),
    audio: UploadFile = File(..., description="Driving audio (WAV/MP3)"),
    prompt: str = Form("", description="Unused — kept for API compatibility"),
    still: bool = Form(True, description="Minimal head movement (recommended for talking-head)"),
    preprocess: str = Form("full", description="Image preprocessing: crop | full | resize"),
):
    """
    Start a lip-sync job. Returns a job_id immediately.
    Poll GET /lipsync/status/{job_id} until status == 'done', then
    fetch the video from GET /lipsync/result/{job_id}.
    """
    img_bytes = await image.read()
    aud_bytes = await audio.read()

    if len(img_bytes) == 0:
        raise HTTPException(status_code=400, detail="Image file is empty")
    if len(aud_bytes) == 0:
        raise HTTPException(status_code=400, detail="Audio file is empty")

    job_id = str(uuid.uuid4())
    job_dir = LIPSYNC_OUTPUT_DIR / f"{job_id}_input"
    job_dir.mkdir(exist_ok=True)

    img_suffix = Path(image.filename or "avatar.png").suffix or ".png"
    aud_suffix = Path(audio.filename or "voice.wav").suffix or ".wav"
    img_path = str(job_dir / f"image{img_suffix}")
    aud_path = str(job_dir / f"audio{aud_suffix}")

    with open(img_path, "wb") as f:
        f.write(img_bytes)
    with open(aud_path, "wb") as f:
        f.write(aud_bytes)

    _jobs[job_id] = {"status": "processing", "video_path": None, "error": None}

    loop = asyncio.get_event_loop()
    loop.run_in_executor(_thread_pool, _run_sadtalker, job_id, img_path, aud_path, still, preprocess)

    print(f"[lipsync] started job {job_id}")
    return JSONResponse({"job_id": job_id, "status": "processing"}, status_code=202)


@app.get("/lipsync/status/{job_id}", tags=["LipSync"])
def lipsync_status(job_id: str):
    """Poll job status: processing | done | failed"""
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] == "failed":
        return JSONResponse({"job_id": job_id, "status": "failed", "error": job["error"]}, status_code=500)
    return JSONResponse({"job_id": job_id, "status": job["status"]})


@app.get("/lipsync/result/{job_id}", tags=["LipSync"])
def lipsync_result(job_id: str):
    """Fetch the completed video as base64. Only available when status == 'done'."""
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
        "width":            512,
        "height":           512,
        "frames":           None,
    })
