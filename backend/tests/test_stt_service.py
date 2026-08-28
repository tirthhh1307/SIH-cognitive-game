from backend.services.stt_service import WhisperTranscriber


def test_whisper_defaults_to_cpu_int8():
    transcriber = WhisperTranscriber(model_factory=lambda *args, **kwargs: (args, kwargs))
    _, kwargs = transcriber._get_model()
    assert kwargs == {"device": "cpu", "compute_type": "int8"}


def test_transcribe_rejects_unsupported_audio_type():
    transcriber = WhisperTranscriber(model_factory=lambda *args, **kwargs: None)
    try:
        transcriber.transcribe(b"audio", "application/octet-stream")
    except ValueError as error:
        assert str(error) == "Unsupported audio type"
    else:
        raise AssertionError("Unsupported audio type was accepted")
