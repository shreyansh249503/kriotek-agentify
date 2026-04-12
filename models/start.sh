#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Activate venv if it exists
if [ -f ".venv/bin/activate" ]; then
  source .venv/bin/activate
fi

# Default SadTalker path
export SADTALKER_REPO="${SADTALKER_REPO:-$SCRIPT_DIR/SadTalker}"
export SADTALKER_CHECKPOINTS="${SADTALKER_CHECKPOINTS:-$SADTALKER_REPO/checkpoints}"
export SADTALKER_CONFIG="${SADTALKER_CONFIG:-$SADTALKER_REPO/src/config}"

exec uvicorn app:app --host 0.0.0.0 --port 8000 --reload
