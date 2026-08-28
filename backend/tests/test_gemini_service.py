from backend.services.gemini_service import GeminiService, normalize_history


class FakeModels:
    def __init__(self):
        self.request = None

    def generate_content(self, **request):
        self.request = request
        return type("Reply", (), {"text": "It is lovely to hear from you."})()


class FakeClient:
    def __init__(self):
        self.models = FakeModels()


def test_history_keeps_only_eight_valid_messages():
    history = [{"role": "user", "text": str(index)} for index in range(10)]
    assert [item["text"] for item in normalize_history(history)] == [
        str(index) for index in range(2, 10)
    ]


def test_generate_reply_uses_configured_model():
    client = FakeClient()
    service = GeminiService(api_key="test", client=client)
    assert service.generate_reply("Hello", []) == "It is lovely to hear from you."
    assert client.models.request["model"] == "gemini-3.1-flash-lite"


def test_missing_key_is_not_configured():
    assert GeminiService(api_key="").configured is False
