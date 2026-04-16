"""
AI Models API
─────────────
Endpoints:
  POST /image/generate  — SDXL-Base 1.0  (text → image)
  POST /tts/generate    — Kokoro TTS      (text → speech)
  GET  /health          — model status

Lip-sync is handled by the EchoMimic V3 server (echomimic_v3_server.py, port 8001).

Start:
    cd models
    source .venv/bin/activate
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload
"""

import io
import os
import base64
from typing import Optional

import certifi
os.environ.setdefault("SSL_CERT_FILE", certifi.where())
os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")
os.environ.setdefault("PYTORCH_MPS_HIGH_WATERMARK_RATIO", "1.7")

import numpy as np
import soundfile as sf
import torch
from diffusers import AutoPipelineForText2Image
from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import JSONResponse
from kokoro import KPipeline
from PIL import Image
from pydantic import BaseModel

# ─────────────────────────────────────────────────────────────────────────────
# Device  (cuda → mps → cpu)
# ─────────────────────────────────────────────────────────────────────────────

device = (
    "cuda" if torch.cuda.is_available()
    else "mps" if torch.backends.mps.is_available()
    else "cpu"
)
print(f"[startup] device: {device}")

app = FastAPI(
    title="AI Models API",
    description="SDXL-Base 1.0 · Kokoro TTS",
    version="4.0.0",
)

# ─────────────────────────────────────────────────────────────────────────────
# SDXL-Base 1.0  (image generation)
#
# Why not SDXL-Turbo?
#   Turbo is distilled for 1–4 step generation with guidance_scale=0.0.
#   It produces fast but low-quality images — no prompt adherence, no detail.
#   SDXL-Base with 20 steps + guidance_scale=7.5 generates at native 1024×1024
#   with dramatically better anatomy, detail, and prompt following.
#   On CUDA: ~8–15 s.  On MPS (M-series): ~30–90 s.  Worth the wait for avatars.
# ─────────────────────────────────────────────────────────────────────────────

# float16 on CUDA (fast + memory efficient); float32 on MPS/CPU (MPS fp16 support
# is limited for SDXL's attention layers).
_img_dtype = torch.float16 if device == "cuda" else torch.float32

print("[IMG] Loading SDXL-Base 1.0…")
img_pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=_img_dtype,
    variant="fp16" if device == "cuda" else None,
    use_safetensors=True,
).to(device)

# Enable memory-efficient attention — reduces VRAM/RAM usage and speeds up
# generation on both CUDA and MPS.
img_pipe.enable_attention_slicing()

print("[IMG] Ready.")

# ─────────────────────────────────────────────────────────────────────────────
# Kokoro TTS
# ─────────────────────────────────────────────────────────────────────────────

_KOKORO_SR = 24_000

print("[TTS] Loading Kokoro…")
tts_pipe = KPipeline(lang_code="a")
print("[TTS] Ready.")

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


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "device": device,
        "models": {
            "image":   "sdxl-base-1.0",
            "tts":     "kokoro",
            "lipsync": "echomimic-v3 (port 8001)",
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /image/generate
# ─────────────────────────────────────────────────────────────────────────────

# Default negative prompt — covers the most common SDXL failure modes.
_DEFAULT_NEGATIVE = (
    "blurry, low quality, bad anatomy, deformed face, ugly, disfigured, "
    "extra limbs, missing fingers, watermark, text, signature, cropped, "
    "worst quality, jpeg artifacts, oversaturated"
)


class ImageRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    width:  int   = 1024
    height: int   = 1024
    steps:  int   = 20
    guidance_scale: float = 7.5
    seed:   Optional[int] = None


@app.post("/image/generate", tags=["Image"])
def image_generate(req: ImageRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt is required")

    # Clamp to reasonable bounds to prevent OOM / very long waits
    width  = max(512, min(req.width,  1024))
    height = max(512, min(req.height, 1024))
    steps  = max(10,  min(req.steps,  50))

    generator = (
        torch.Generator(device=device).manual_seed(req.seed)
        if req.seed is not None else None
    )

    negative_prompt = req.negative_prompt if req.negative_prompt is not None else _DEFAULT_NEGATIVE

    result = img_pipe(
        prompt=req.prompt,
        negative_prompt=negative_prompt,
        width=width,
        height=height,
        num_inference_steps=steps,
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
# POST /tts/generate
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/tts/generate", tags=["TTS"])
async def tts_generate(
    text:  str   = Form(...),
    voice: str   = Form("af_heart"),
    speed: float = Form(1.0),
):
    if not text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    try:
        chunks = [a for _, _, a in tts_pipe(text, voice=voice, speed=speed) if a is not None]
        if not chunks:
            raise HTTPException(status_code=500, detail="TTS produced no audio")
        audio_np = np.concatenate(chunks, axis=0)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {e}")

    return JSONResponse({
        "audio":            f"data:audio/wav;base64,{_to_b64_wav(audio_np, _KOKORO_SR)}",
        "sample_rate":      _KOKORO_SR,
        "duration_seconds": round(len(audio_np) / _KOKORO_SR, 2),
    })
