from fastapi.testclient import TestClient
import io
import json

from backend.app import app

client = TestClient(app)


class FakeGemini:
    configured = True

    def generate_reply(self, text, history):
        assert text == "Hello there"
        assert len(history) <= 8
        return "Hello. How are you feeling today?"


class FakeTranscriber:
    available = True

    def transcribe(self, data, content_type):
        assert data == b"audio"
        assert content_type == "audio/webm"
        return "Hello there"

def test_health(monkeypatch):
    monkeypatch.setattr("backend.app.rhubarb_available", lambda: False)
    app.state.gemini = type("Gemini", (), {"configured": False})()
    app.state.transcriber = type("Transcriber", (), {"available": True})()
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "geminiConfigured": False,
        "whisperAvailable": True,
        "chatterboxEnabled": False,
        "rhubarbAvailable": False,
    }

def test_text_chat_returns_gemini_reply():
    app.state.gemini = FakeGemini()
    response = client.post(
        "/api/chat/interact",
        data={"text": "Hello there", "history": "[]", "profile_id": "user1"},
    )
    assert response.status_code == 200
    assert response.json() == {
        "inputText": "Hello there",
        "text": "Hello. How are you feeling today?",
    }


def test_audio_chat_transcribes_on_cpu():
    app.state.gemini = FakeGemini()
    app.state.transcriber = FakeTranscriber()
    response = client.post(
        "/api/chat/interact",
        data={"history": json.dumps([]), "profile_id": "user1"},
        files={"audio": ("voice.webm", b"audio", "audio/webm")},
    )
    assert response.status_code == 200
    assert response.json()["inputText"] == "Hello there"


def test_chat_rejects_oversized_history():
    app.state.gemini = FakeGemini()
    response = client.post(
        "/api/chat/interact",
        data={
            "text": "Hello there",
            "history": json.dumps([{"role": "user", "text": "x" * 20_000}]),
        },
    )
    assert response.status_code == 400
    assert "history" in response.json()["detail"].lower()

def test_voice_enrollment_is_disabled():
    dummy_wav = io.BytesIO(b"RIFF....WAVEfmt ....data....")
    response = client.post(
        "/api/voice/enroll",
        data={"profile_id": "test_user"},
        files={"file": ("test.wav", dummy_wav, "audio/wav")}
    )
    assert response.status_code == 503
    assert "disabled" in response.json()["detail"].lower()
