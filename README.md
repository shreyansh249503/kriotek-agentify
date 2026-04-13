# Agentify

AI-powered chatbot platform with an avatar studio. Create talking-head video avatars using SDXL-Turbo (image), Kokoro TTS (voice), and EchoMimic V3 (lip-sync), then embed them in your chatbot widget.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 or later |
| Python | 3.10 – 3.11 |
| Git | any recent version |
| ffmpeg | required by both lip-sync engines |

> **macOS:** `brew install ffmpeg`
> **Ubuntu/Debian:** `sudo apt install ffmpeg`

---

## 1. Clone the repository

```bash
git clone <repo-url> agentify-monorepo
cd agentify-monorepo
```

---

## 2. Frontend setup

```bash
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

**.env.local variables:**

```env
# Supabase (https://supabase.com/dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-secret-key>
SUPABASE_DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres

# Stripe (https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SadTalker server (default fine for local dev)
MODELS_API_URL=http://localhost:8000

# EchoMimic V3 server — only needed if using the EchoMimic engine
ECHOMIMIC_API_URL=http://localhost:8001
```

---

## 3. Image + TTS backend setup

SDXL-Turbo (image) and Kokoro TTS run in a lightweight server on port 8000. Supports CPU, MPS (Apple Silicon), and CUDA.

```bash
cd models

python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install --upgrade pip
pip install -r requirements.txt

# PyTorch — pick the command for your hardware:
# CUDA (NVIDIA GPU):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
# MPS (Apple Silicon):
pip install torch torchvision torchaudio
# CPU only:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

SDXL-Turbo and Kokoro weights are downloaded automatically from Hugging Face on first start (~8 GB).

---

## 4. EchoMimic V3 backend setup *(CUDA or MPS)*

EchoMimic V3 handles lip-sync and produces 768 px output. It runs as a separate server on port 8001 and supports:
- **CUDA** — NVIDIA GPU with ≥12 GB VRAM (recommended)
- **MPS** — Apple Silicon (M1/M2/M3/M4) using unified memory

> EchoMimic V3 uses `tensorflow==2.15.0` which conflicts with the image/TTS environment — it runs in its own isolated venv.

### 4a. Clone the EchoMimicV3 repo

```bash
cd models
git clone https://github.com/antgroup/echomimic_v3 EchoMimicV3
```

### 4b. Create a dedicated virtual environment

```bash
cd models

python3 -m venv echomimic_venv
source echomimic_venv/bin/activate

pip install --upgrade pip

# PyTorch with CUDA (required — no MPS/CPU support)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

pip install -r echomimic_v3_requirements.txt
```

### 4c. Download model weights (~20 GB)

```bash
cd models
source echomimic_venv/bin/activate
python download_echomimic_weights.py
```

This downloads into `models/echomimic_weights/`:

| Folder | Source | Size |
|--------|--------|------|
| `base/` | `alibaba-pai/Wan2.1-Fun-V1.1-1.3B-InP` | ~12 GB |
| `wav2vec2/` | `TencentGameMate/chinese-wav2vec2-base` | ~400 MB |
| `transformer/` | `BadToBest/EchoMimicV3` | ~7 GB |

---

## 5. Database setup (Supabase)


TypeORM `synchronize: true` creates all tables automatically on first run. You only need:

1. Create a project at [supabase.com](https://supabase.com)
2. Enable the **pgvector** extension: *Database → Extensions → vector*
3. Set `SUPABASE_DATABASE_URL` in `.env.local`

---

## 6. Running locally

Open **3 terminals**:

```bash
# Terminal 1 — Image + TTS server (port 8000)
cd models && source .venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — EchoMimic V3 lip-sync server (port 8001)
cd models && source echomimic_venv/bin/activate
uvicorn echomimic_v3_server:app --host 0.0.0.0 --port 8001

# Terminal 3 — Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 7. Project structure

```
agentify-monorepo/
├── app/
│   ├── (auth)/admin/
│   │   └── avatar/              # Avatar studio (image → voice → video)
│   └── api/models/
│       ├── image/generate/      # → port 8000
│       ├── tts/generate/        # → port 8000
│       └── lipsync/             # → port 8001 (EchoMimic V3)
│           ├── generate/
│           ├── status/[jobId]/
│           └── result/[jobId]/
├── models/
│   ├── app.py                   # SDXL-Turbo + Kokoro TTS (port 8000)
│   ├── echomimic_v3_server.py   # EchoMimic V3 lip-sync (port 8001)
│   ├── download_echomimic_weights.py
│   ├── EchoMimicV3/             # Cloned repo (see step 4a)
│   ├── echomimic_weights/       # Downloaded weights — gitignored (~20 GB)
│   └── echomimic_results/       # Runtime job output — gitignored
├── services/
│   └── avatar.api.ts
├── types/
└── lib/
```

---

## 8. Hardware requirements

| Service | Minimum | Recommended |
|---------|---------|-------------|
| Image generation (SDXL-Turbo) | 8 GB RAM / CPU | Apple M-series or NVIDIA GPU |
| Voice synthesis (Kokoro TTS) | 4 GB RAM / CPU | any modern CPU |
| Lip-sync video (EchoMimic V3) | Apple M-series (MPS) | NVIDIA GPU ≥12 GB VRAM |
