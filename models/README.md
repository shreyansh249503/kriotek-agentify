# AI Models API

Unified FastAPI server exposing three AI models on a single port.
All three models are **Mac-friendly** (MPS / CPU) and fully open-source.

| Endpoint | Model | License | Task |
|---|---|---|---|
| `POST /image/generate` | FLUX.1-schnell | Apache 2.0 | Text → Image |
| `POST /tts/generate` | Kokoro TTS | Apache 2.0 | Text → Speech |
| `POST /lipsync/generate` | SadTalker | MIT | Image + Audio → Lip-sync Video |

---

## Local Setup

### 1. Create and activate a virtual environment

```bash
cd models
python -m venv .venv

# Mac / Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

### 2. Install PyTorch

```bash
# Mac (includes MPS support for Apple Silicon)
pip install torch torchvision torchaudio

# Linux + NVIDIA GPU
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Linux CPU-only
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

### 3. Clone SadTalker and download its checkpoints

```bash
git clone https://github.com/OpenTalker/SadTalker.git
cd SadTalker && bash scripts/download_models.sh && cd ..
```

> **Do NOT run `pip install -r SadTalker/requirements.txt`** — it pins very old versions that conflict with modern Python. All SadTalker deps are included in our `requirements.txt` below with compatible versions.

> Checkpoints are ~300 MB and only need to be downloaded once.

### 4. Install all dependencies

```bash
pip install -r requirements.txt
```

> FLUX.1-schnell and Kokoro weights are downloaded automatically from HuggingFace on first request and cached in `~/.cache/huggingface`.

### 5. Start the server

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at **http://localhost:8000**
Interactive docs at **http://localhost:8000/docs**

### Deactivate the virtual environment

```bash
deactivate
```

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `SADTALKER_REPO` | `./SadTalker` | Path to cloned SadTalker repo |
| `SADTALKER_CHECKPOINTS` | `<SADTALKER_REPO>/checkpoints` | SadTalker model weights |
| `SADTALKER_CONFIG` | `<SADTALKER_REPO>/src/config` | SadTalker config directory |

---

## API Reference

### `POST /image/generate`

```json
{
  "prompt": "A professional woman in her 30s, studio lighting",
  "width": 512,
  "height": 512,
  "steps": 4,
  "guidance_scale": 0.0,
  "seed": 42
}
```

Returns `{ "image": "data:image/png;base64,...", "width": 512, "height": 512 }`

### `POST /tts/generate`  (multipart form)

| Field | Type | Default | Description |
|---|---|---|---|
| `text` | string | required | Text to speak |
| `voice` | string | `af_heart` | Kokoro voice ID |
| `speed` | float | `1.0` | Speech speed multiplier |

Available voices: `af_heart`, `af_sky`, `am_adam`, `am_michael`, `bf_emma`, `bm_george`

Returns `{ "audio": "data:audio/wav;base64,...", "sample_rate": 24000, "duration_seconds": 3.2 }`

### `POST /lipsync/generate`  (multipart form)

| Field | Type | Default | Description |
|---|---|---|---|
| `image` | file | required | Reference face image (PNG/JPG) |
| `audio` | file | required | Driving audio (WAV/MP3) |
| `still` | bool | `true` | Minimal head movement |
| `preprocess` | string | `crop` | `crop` / `full` / `resize` |

Returns `{ "video": "data:video/mp4;base64,..." }`
