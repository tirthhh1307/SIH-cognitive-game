import os


MODEL = "gemini-3.1-flash-lite"
SYSTEM_INSTRUCTION = (
    "You are Apon Mon, a calm companion for an older adult. Reply in short, "
    "clear sentences. Never diagnose dementia or replace medical care. "
    "For medical decisions, ask the person to involve a caregiver or qualified clinician."
)


def normalize_history(history):
    valid = [
        {"role": item["role"], "text": item["text"].strip()[:2000]}
        for item in history
        if isinstance(item, dict)
        and item.get("role") in {"user", "model"}
        and isinstance(item.get("text"), str)
        and item["text"].strip()
    ]
    return valid[-8:]


class GeminiService:
    def __init__(self, api_key=None, client=None):
        self.api_key = api_key if api_key is not None else os.getenv("GEMINI_API_KEY", "")
        self._client = client

    @property
    def configured(self):
        return bool(self.api_key)

    def _get_client(self):
        if not self.configured:
            raise RuntimeError("Gemini is not configured")
        if self._client is None:
            from google import genai
            from google.genai import types

            self._client = genai.Client(
                api_key=self.api_key,
                http_options=types.HttpOptions(timeout=20_000),
            )
        return self._client

    def generate_reply(self, text, history):
        from google.genai import types

        contents = [
            {"role": item["role"], "parts": [{"text": item["text"]}]}
            for item in normalize_history(history)
        ]
        contents.append({"role": "user", "parts": [{"text": text}]})
        response = self._get_client().models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.4,
                max_output_tokens=180,
            ),
        )
        reply = (response.text or "").strip()
        if not reply:
            raise RuntimeError("Gemini returned an empty response")
        return reply
