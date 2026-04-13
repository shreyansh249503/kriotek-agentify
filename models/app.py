"""
AI Models API
─────────────
Endpoints:
  POST /image/generate  — SDXL-Turbo  (text → image)
  POST /tts/generate    — Kokoro TTS  (text → speech)
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
    description="SDXL-Turbo · Kokoro TTS",
    version="3.0.0",
)

# ─────────────────────────────────────────────────────────────────────────────
# SDXL-Turbo  (image generation)
# ─────────────────────────────────────────────────────────────────────────────

_img_dtype = torch.float16 if device == "cuda" else torch.float32

print("[IMG] Loading SDXL-Turbo…")
img_pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo",
    torch_dtype=_img_dtype,
    variant="fp16" if device == "cuda" else None,
).to(device)
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
            "image":   "sdxl-turbo",
            "tts":     "kokoro",
            "lipsync": "echomimic-v3 (port 8001)",
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /image/generate
# ─────────────────────────────────────────────────────────────────────────────

class ImageRequest(BaseModel):
    prompt: str
    width: int = 512
    height: int = 512
    guidance_scale: float = 0.0
    seed: Optional[int] = None


@app.post("/image/generate", tags=["Image"])
def image_generate(req: ImageRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt is required")

    generator = (
        torch.Generator(device=device).manual_seed(req.seed)
        if req.seed is not None else None
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
