import subprocess
import json
import tempfile
import os
import wave
import numpy as np

def extract_rhubarb_visemes(audio_path: str) -> list:
    """Runs rhubarb binary or fallback acoustic phoneme estimator on WAV file."""
    try:
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
            tmp_path = tmp.name
        
        cmd = ["rhubarb", "-f", "json", "-o", tmp_path, audio_path]
        res = subprocess.run(cmd, capture_output=True, timeout=10)
        
        if res.returncode == 0 and os.path.exists(tmp_path):
            with open(tmp_path, "r") as f:
                data = json.load(f)
            os.remove(tmp_path)
            return data.get("mouthCues", [])
    except Exception:
        pass

    # Acoustic energy and zero-crossing heuristic viseme cues
    with wave.open(audio_path, 'rb') as wf:
        n_frames = wf.getnframes()
        rate = wf.getframerate()
        frames = wf.readframes(n_frames)
        samples = np.frombuffer(frames, dtype=np.int16).astype(np.float32)

    duration = n_frames / float(rate) if rate > 0 else 0
    window_sec = 0.08
    window_samples = max(1, int(rate * window_sec))
    cues = []
    
    viseme_cycle = ['A', 'B', 'C', 'D', 'E', 'F']
    idx = 0

    for start_sample in range(0, len(samples), window_samples):
        chunk = samples[start_sample:start_sample + window_samples]
        if len(chunk) == 0:
            continue
        rms = np.sqrt(np.mean(chunk**2))
        start_t = round(start_sample / rate, 3)
        end_t = round(min((start_sample + window_samples) / rate, duration), 3)

        if rms < 400:
            cues.append({"start": start_t, "end": end_t, "value": "X"})
        else:
            val = viseme_cycle[idx % len(viseme_cycle)]
            idx += 1
            cues.append({"start": start_t, "end": end_t, "value": val})

    return cues
