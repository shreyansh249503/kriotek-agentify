"""
Precompute EchoMimic text embeddings
─────────────────────────────────────
Loads UMT5-XXL once, encodes the fixed positive and negative prompts used by
EchoMimic V3, saves the result to echomimic_weights/text_embeds.pt, then
unloads the model from RAM/GPU.

Run once before starting the lipsync server:
    cd models
    source echomimic_venv/bin/activate
    python precompute_text_embeds.py

After this runs, echomimic_v3_server.py loads the tiny .pt file instead of
the 20 GB UMT5-XXL model — saving ~20 GB RAM and 5-10 min per job.
"""

import gc
import os
import sys
from pathlib import Path

# ── torch.load safety patch (same as server) ─────────────────────────────────
import functools
import torch as _t

_orig_load = _t.load
@functools.wraps(_orig_load)
def _safe_load(f, *a, **kw):
    if isinstance(f, (str, os.PathLike)):
        kw.setdefault("mmap", True)
        kw.setdefault("weights_only", False)
    return _orig_load(f, *a, **kw)
_t.load = _safe_load

# ── transformers torch version gate patch ─────────────────────────────────────
if tuple(int(x) for x in _t.__version__.split("+")[0].split(".")[:2]) < (2, 6):
    try:
        import transformers.utils.import_utils as _tui
        if hasattr(_tui, "check_torch_load_is_safe"):
            _tui.check_torch_load_is_safe = lambda: None
    except Exception:
        pass

import torch
from omegaconf import OmegaConf
from transformers import AutoTokenizer

_SCRIPT_DIR = Path(__file__).parent
_REPO       = Path(os.environ.get("ECHOMIMIC_REPO",    _SCRIPT_DIR / "EchoMimicV3"))
_WEIGHTS    = Path(os.environ.get("ECHOMIMIC_WEIGHTS", _SCRIPT_DIR / "echomimic_weights"))
_OUT_FILE   = _WEIGHTS / "text_embeds.pt"

# ── Fixed prompts (must match exactly what echomimic_v3_server.py uses) ───────
POSITIVE_PROMPT = "A person is speaking naturally, realistic, high quality."
NEGATIVE_PROMPT = (
    "Gesture is bad. Gesture is unclear. Strange and twisted hands. "
    "Bad hands. Bad fingers. Unclear and blurry hands."
)

def main():
    if _OUT_FILE.exists():
        print(f"[precompute] Text embeddings already exist at {_OUT_FILE} — skipping.")
        print("[precompute] Delete the file to force recomputation.")
        return

    if not _REPO.exists():
        print(f"ERROR: EchoMimicV3 repo not found at {_REPO}")
        sys.exit(1)
    if not _WEIGHTS.exists():
        print(f"ERROR: echomimic_weights not found at {_WEIGHTS}")
        sys.exit(1)

    sys.path.insert(0, str(_REPO))
    from src.wan_text_encoder import WanT5EncoderModel  # noqa: E402

    config  = OmegaConf.load(str(_REPO / "config" / "config.yaml"))
    te_cfg  = config["text_encoder_kwargs"]
    BASE    = _WEIGHTS / "base"
    te_path = str(BASE / te_cfg.get("text_encoder_subpath", "text_encoder"))
    tok_sub = te_cfg.get("tokenizer_subpath", "tokenizer")
    tok_path = str(BASE / tok_sub) if (BASE / tok_sub).exists() else tok_sub

    DTYPE = torch.bfloat16 if torch.cuda.is_available() else torch.float32

    print("[precompute] Loading tokenizer…")
    tokenizer = AutoTokenizer.from_pretrained(tok_path)

    # Tokenize both prompts — save the input_ids so the fake encoder can
    # identify which prompt is being encoded at inference time.
    def tokenize(text: str):
        return tokenizer(
            text,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt",
        )

    pos_tok = tokenize(POSITIVE_PROMPT)
    neg_tok = tokenize(NEGATIVE_PROMPT)

    print("[precompute] Loading UMT5-XXL text encoder (~20 GB, please wait)…")
    text_encoder = WanT5EncoderModel.from_pretrained(
        te_path,
        additional_kwargs=OmegaConf.to_container(te_cfg),
        low_cpu_mem_usage=False,
        torch_dtype=DTYPE,
    ).eval()
    print("[precompute] UMT5-XXL loaded.")

    print("[precompute] Encoding positive prompt…")
    with torch.no_grad():
        pos_embeds = text_encoder(
            pos_tok["input_ids"],
            attention_mask=pos_tok["attention_mask"],
        )[0].cpu()

    print("[precompute] Encoding negative prompt…")
    with torch.no_grad():
        neg_embeds = text_encoder(
            neg_tok["input_ids"],
            attention_mask=neg_tok["attention_mask"],
        )[0].cpu()

    print("[precompute] Saving embeddings…")
    torch.save(
        {
            "positive":      pos_embeds,
            "negative":      neg_embeds,
            "pos_input_ids": pos_tok["input_ids"],
            "neg_input_ids": neg_tok["input_ids"],
            "dtype":         str(DTYPE),
        },
        str(_OUT_FILE),
    )
    size_mb = _OUT_FILE.stat().st_size / 1e6
    print(f"[precompute] Saved → {_OUT_FILE}  ({size_mb:.1f} MB)")
    print(f"[precompute]   positive shape: {pos_embeds.shape}")
    print(f"[precompute]   negative shape: {neg_embeds.shape}")

    # ── Unload UMT5-XXL ───────────────────────────────────────────────────────
    print("[precompute] Unloading UMT5-XXL from RAM…")
    del text_encoder, pos_tok, neg_tok, tokenizer
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    print("[precompute] Done. UMT5-XXL unloaded.")


if __name__ == "__main__":
    main()
