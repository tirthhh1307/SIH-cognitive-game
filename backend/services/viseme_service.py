import json
import os
import shutil
import subprocess
import tempfile


def rhubarb_available():
    return shutil.which("rhubarb") is not None

def extract_rhubarb_visemes(audio_path: str) -> list:
    """Run Rhubarb when installed; absence never fabricates viseme cues."""
    if not rhubarb_available():
        return []

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
            tmp_path = tmp.name

        cmd = ["rhubarb", "-f", "json", "-o", tmp_path, audio_path]
        res = subprocess.run(cmd, capture_output=True, timeout=10)
        if res.returncode != 0:
            return []
        with open(tmp_path, encoding="utf-8") as output:
            return json.load(output).get("mouthCues", [])
    except (OSError, subprocess.SubprocessError, json.JSONDecodeError):
        return []
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
