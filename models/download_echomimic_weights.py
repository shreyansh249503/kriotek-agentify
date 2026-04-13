"""
Download all EchoMimic V3 model weights from HuggingFace.

Usage:
    cd models
    python download_echomimic_weights.py

Downloads ~20 GB total into models/echomimic_weights/:
  base/        — Wan2.1-Fun-V1.1-1.3B-InP  (VAE, text encoder, CLIP, tokenizer)
  wav2vec2/    — TencentGameMate/chinese-wav2vec2-base  (audio encoder)
  transformer/ — BadToBest/EchoMimicV3  (EchoMimicV3 Flash transformer weights)
"""

from pathlib import Path
from huggingface_hub import snapshot_download

WEIGHTS_DIR = Path(__file__).parent / "echomimic_weights"
WEIGHTS_DIR.mkdir(exist_ok=True)


def download(repo_id: str, local_dir: Path, **kwargs):
    print(f"\n{'─'*60}")
    print(f"  Downloading: {repo_id}")
    print(f"  Destination: {local_dir}")
    print(f"{'─'*60}")
    snapshot_download(repo_id=repo_id, local_dir=str(local_dir), **kwargs)
    print(f"  ✓ Done: {repo_id}")


if __name__ == "__main__":
    # 1. Wan2.1 base model (~12 GB) — VAE + text encoder + CLIP + tokenizer
    download(
        "alibaba-pai/Wan2.1-Fun-V1.1-1.3B-InP",
        WEIGHTS_DIR / "base",
    )

    # 2. Chinese Wav2Vec2 (~400 MB) — audio feature extractor
    download(
        "TencentGameMate/chinese-wav2vec2-base",
        WEIGHTS_DIR / "wav2vec2",
    )

    # 3. EchoMimicV3 transformer weights (~7 GB)
    # Repo structure: echomimic_weights/transformer/transformer/config.json + *.safetensors
    download(
        "BadToBest/EchoMimicV3",
        WEIGHTS_DIR / "transformer",
        allow_patterns=["transformer/*", "*.json", "*.safetensors"],
    )

    print("\n✓ All EchoMimic V3 weights downloaded successfully.")
    print(f"  Location: {WEIGHTS_DIR.resolve()}")
