# Agentify

AI-powered chatbot platform with an avatar studio. Create talking-head video avatars using SDXL-Turbo (image), Kokoro TTS (voice), and SadTalker (lip-sync), then embed them in your chatbot widget.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 or later |
| Python | 3.10 – 3.11 |
| Git | any recent version |
| ffmpeg | required by SadTalker |

> **macOS:** `brew install ffmpeg`
> **Ubuntu/Debian:** `sudo apt install ffmpeg`

---

## 1. Clone the repository

```bash
git clone <repo-url> agentify-monorepo
cd agentify-monorepo

# SadTalker is a git submodule
git submodule update --init --recursive
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

# Python models backend (default is fine for local dev)
MODELS_API_URL=http://localhost:8000
```

---

## 3. Python models backend setup

All AI models run in a separate Python process inside `models/`.

```bash
cd models

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install PyTorch — pick the command for your hardware:
# CUDA (NVIDIA GPU):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
# MPS (Apple Silicon):
pip install torch torchvision torchaudio
# CPU only:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

### 3a. Download SadTalker checkpoints

SadTalker requires pre-trained weights (~1 GB). Run the official download script:

```bash
cd SadTalker
bash scripts/download_models.sh
cd ..
```

If the script is unavailable, download manually from the [SadTalker releases](https://github.com/OpenTalker/SadTalker/releases) and place them in `SadTalker/checkpoints/`.

### 3b. SDXL-Turbo & Kokoro weights

These are downloaded automatically from Hugging Face the first time the server starts (requires an internet connection). Subsequent starts use the local cache (`~/.cache/huggingface`).

> First startup will take several minutes while models download (~8 GB total).

---

## 4. Database setup (Supabase)

The app uses TypeORM with `synchronize: true`, so all tables are created automatically on first run. You only need:

1. Create a project at [supabase.com](https://supabase.com)
2. Enable the **pgvector** extension: *Database → Extensions → vector*
3. Set the `SUPABASE_DATABASE_URL` in `.env.local` to your project's connection string

---

## 5. Running locally

Open **two terminals**:

**Terminal 1 — Python models API:**
```bash
cd models
source .venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Next.js frontend:**
```bash
# from the repo root
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 6. Project structure

```
agentify-monorepo/
├── app/                    # Next.js App Router
│   ├── (auth)/admin/       # Protected admin pages
│   │   ├── avatar/         # Avatar studio (image → voice → video)
│   │   ├── bots/           # Bot management
│   │   └── settings/       # Account settings
│   └── api/                # API routes (proxies + CRUD)
├── components/             # Shared React components
├── models/                 # Python FastAPI AI backend
│   ├── app.py              # Main server (SDXL-Turbo, Kokoro, SadTalker)
│   ├── SadTalker/          # Git submodule
│   ├── lipsync_results/    # Runtime job output (gitignored)
│   └── requirements.txt
├── services/               # API client functions
├── types/                  # TypeScript types
└── lib/                    # Supabase client, axios instance
```

---

## 7. Hardware recommendations

| Feature | Minimum | Recommended |
|---------|---------|-------------|
| Image generation (SDXL-Turbo) | 8 GB RAM / CPU | Apple M-series or NVIDIA GPU |
| Voice synthesis (Kokoro) | 4 GB RAM / CPU | any modern CPU |
| Lip-sync video (SadTalker) | 8 GB RAM / CPU | NVIDIA GPU with 8 GB VRAM |

On Apple Silicon, MPS acceleration is used automatically. On CPU, expect 2–5 min per lip-sync video.
