class VoiceCloningDisabled(RuntimeError):
    pass


class ChatterboxAdapter:
    @property
    def enabled(self):
        return False

    def enroll_voice(self, *_args, **_kwargs):
        raise VoiceCloningDisabled("Voice cloning is disabled")

    def synthesize_speech(self, *_args, **_kwargs):
        raise VoiceCloningDisabled("Voice cloning is disabled")
