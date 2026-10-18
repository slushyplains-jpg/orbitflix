"""Record a pipeline stage from inside a check script, so nobody has to run explainer-status.py by hand."""
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))


def slug_of(path):
    """notes/explainer/<slug>/... -> <slug>, or None for files outside the notes folder."""
    parts = os.path.abspath(path).split(os.sep)
    return parts[parts.index("explainer") + 1] if "explainer" in parts and parts.index("explainer") + 1 < len(parts) - 1 else None


def record(slug, stage, note):
    if not slug:
        return
    r = subprocess.run(["/usr/local/bin/python3.11", os.path.join(HERE, "explainer-status.py"), slug, stage, note],
                       capture_output=True, text=True)
    print(f"recorded {stage}" if r.returncode == 0 else f"not recorded: {(r.stderr or r.stdout).strip()[:120]}")
