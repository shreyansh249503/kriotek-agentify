#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Agentify model servers launcher
#
# Usage (run from repo root or models/ directory):
#   bash models/start.sh            — start both servers
#   bash models/start.sh image      — image/TTS only      (port 8000)
#   bash models/start.sh lipsync    — EchoMimic V3 only   (port 8001)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True

IMAGE_VENV="$SCRIPT_DIR/.venv"
ECHO_VENV="$SCRIPT_DIR/echomimic_venv"

# ── Colour helpers ────────────────────────────────────────────────────────────
_cyan()  { printf '\033[0;36m%s\033[0m\n' "$*"; }
_green() { printf '\033[0;32m%s\033[0m\n' "$*"; }
_red()   { printf '\033[0;31m%s\033[0m\n' "$*"; }
_bold()  { printf '\033[1m%s\033[0m\n'    "$*"; }

# ── Guard: check a venv exists ────────────────────────────────────────────────
require_venv() {
  local venv="$1" label="$2" hint="$3"
  if [[ ! -d "$venv" ]]; then
    _red "ERROR: $label venv not found at $venv"
    echo "       $hint"
    exit 1
  fi
}

# ── Start image/TTS server (port 8000) ───────────────────────────────────────
start_image() {
  require_venv "$IMAGE_VENV" "image/TTS" \
    "Run: cd models && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"

  _bold "── Image + TTS server (port 8000) ──"
  _cyan "Activating $IMAGE_VENV"

  # shellcheck source=/dev/null
  source "$IMAGE_VENV/bin/activate"
  _green "Starting uvicorn app:app on port 8000 …"
  (cd "$SCRIPT_DIR" && uvicorn app:app --host 0.0.0.0 --port 8000 --reload) &
  IMAGE_PID=$!
  deactivate
  echo "  PID $IMAGE_PID"
}

# ── Start EchoMimic V3 server (port 8001) ────────────────────────────────────
start_lipsync() {
  require_venv "$ECHO_VENV" "EchoMimic V3" \
    "Run: cd models && python3 -m venv echomimic_venv && source echomimic_venv/bin/activate && pip install -r echomimic_v3_requirements.txt"

  if [[ ! -d "$SCRIPT_DIR/EchoMimicV3" ]]; then
    _red "ERROR: EchoMimicV3 repo not found at $SCRIPT_DIR/EchoMimicV3"
    echo "       Run: cd models && git clone https://github.com/antgroup/echomimic_v3 EchoMimicV3"
    exit 1
  fi

  if [[ ! -d "$SCRIPT_DIR/echomimic_weights" ]]; then
    _red "ERROR: EchoMimic weights not found at $SCRIPT_DIR/echomimic_weights"
    echo "       Run: cd models && source echomimic_venv/bin/activate && python download_echomimic_weights.py"
    exit 1
  fi

  _bold "── EchoMimic V3 lip-sync server (port 8001) ──"
  _cyan "Activating $ECHO_VENV"

  # shellcheck source=/dev/null
  source "$ECHO_VENV/bin/activate"

  # ── Precompute text embeddings (runs UMT5-XXL once, then unloads it) ─────
  # Skipped automatically if echomimic_weights/text_embeds.pt already exists.
  _cyan "Checking text embeddings cache…"
  if [[ ! -f "$SCRIPT_DIR/echomimic_weights/text_embeds.pt" ]]; then
    _bold "text_embeds.pt not found — running precompute (loads UMT5-XXL ~20 GB, takes a few minutes)…"
    (cd "$SCRIPT_DIR" && python precompute_text_embeds.py)
    _green "Text embeddings saved. UMT5-XXL unloaded from RAM."
  else
    _green "Text embeddings cache found — skipping UMT5-XXL load."
  fi

  _green "Starting uvicorn echomimic_v3_server:app on port 8001 …"
  (cd "$SCRIPT_DIR" && uvicorn echomimic_v3_server:app --host 0.0.0.0 --port 8001) &
  ECHO_PID=$!
  deactivate
  echo "  PID $ECHO_PID"
}

# ── Graceful shutdown on Ctrl-C ───────────────────────────────────────────────
IMAGE_PID=""
ECHO_PID=""

cleanup() {
  echo ""
  _bold "Shutting down servers…"
  [[ -n "${IMAGE_PID:-}" ]] && kill "$IMAGE_PID" 2>/dev/null && echo "  Stopped image/TTS  (PID $IMAGE_PID)"
  [[ -n "${ECHO_PID:-}"  ]] && kill "$ECHO_PID"  2>/dev/null && echo "  Stopped EchoMimic  (PID $ECHO_PID)"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Dispatch ──────────────────────────────────────────────────────────────────
MODE="${1:-both}"

case "$MODE" in
  image)
    start_image
    ;;
  lipsync|echomimic)
    start_lipsync
    ;;
  both|"")
    start_image
    start_lipsync
    ;;
  *)
    echo "Usage: $0 [image|lipsync|both]"
    exit 1
    ;;
esac

echo ""
_green "Servers running. Press Ctrl-C to stop."
echo ""
[[ -n "$IMAGE_PID" ]] && echo "  Image/TTS   → http://localhost:8000/health"
[[ -n "$ECHO_PID"  ]] && echo "  EchoMimic   → http://localhost:8001/health"
echo ""

wait
