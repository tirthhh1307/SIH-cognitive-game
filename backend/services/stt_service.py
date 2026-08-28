import importlib.util
import os
import tempfile


SUFFIXES = {
    "audio/webm": ".webm",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/mpeg": ".mp3",
    "audio/ogg": ".ogg",
}


class WhisperTranscriber:
    def __init__(self, model_name=None, model_factory=None):
        self.model_name = model_name or os.getenv("WHISPER_MODEL", "base")
        self.model_factory = model_factory
        self._model = None

    @property
    def available(self):
        return self.model_factory is not None or importlib.util.find_spec("faster_whisper") is not None

    def _get_model(self):
        if self._model is None:
            factory = self.model_factory
            if factory is None:
                from faster_whisper import WhisperModel

                factory = WhisperModel
            self._model = factory(self.model_name, device="cpu", compute_type="int8")
        return self._model

    def transcribe(self, data, content_type):
        media_type = (content_type or "").split(";", 1)[0].lower()
        suffix = SUFFIXES.get(media_type)
        if not suffix:
            raise ValueError("Unsupported audio type")

        path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as audio_file:
                audio_file.write(data)
                path = audio_file.name
            segments, _ = self._get_model().transcribe(path, vad_filter=True, beam_size=1)
            text = " ".join(segment.text.strip() for segment in segments).strip()
            if not text:
                raise ValueError("No speech detected")
            return text
        finally:
            if path and os.path.exists(path):
                os.unlink(path)
