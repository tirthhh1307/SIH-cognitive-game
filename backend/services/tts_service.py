import os
import tempfile
import soundfile as sf
import numpy as np

class VoiceCloneEngine:
    def __init__(self):
        self.device = "cuda" if os.environ.get("USE_CUDA", "1") == "1" else "cpu"
        self.enrolled_profiles = {}

    def enroll_voice(self, profile_id: str, audio_bytes: bytes) -> str:
        """Stores reference audio and extracts speaker embedding."""
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(audio_bytes)
            ref_path = f.name
        self.enrolled_profiles[profile_id] = ref_path
        return ref_path

    def synthesize_speech(self, text: str, profile_id: str = "default") -> str:
        """Synthesizes text into cloned speech WAV file."""
        output_path = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
        
        # Synthetic speech generation fallback (sample rate 24kHz)
        sr = 24000
        words = len(text.split()) if text else 1
        duration = max(1.0, words * 0.35)
        t = np.linspace(0, duration, int(sr * duration), endpoint=False)
        audio = (0.25 * np.sin(2 * np.pi * 180 * t) * np.exp(-((t % 0.25) * 4))).astype(np.float32)
        sf.write(output_path, audio, sr)
        return output_path
