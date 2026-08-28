from fastapi.testclient import TestClient
from backend.app import app
import io

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_chat_interact():
    response = client.post("/api/chat/interact", data={"text": "Hello world", "profile_id": "user1"})
    assert response.status_code == 200
    data = response.json()
    assert "audioUrl" in data
    assert "visemes" in data
    assert isinstance(data["visemes"], list)

def test_voice_enroll():
    dummy_wav = io.BytesIO(b"RIFF....WAVEfmt ....data....")
    response = client.post(
        "/api/voice/enroll",
        data={"profile_id": "test_user"},
        files={"file": ("test.wav", dummy_wav, "audio/wav")}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "enrolled"
