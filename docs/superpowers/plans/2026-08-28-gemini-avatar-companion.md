# Gemini Avatar Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing avatar demo scaffold with a usable Gemini companion that accepts text or CPU-transcribed speech, speaks through the browser accessibility voice, and drives a local 3D cartoon avatar with approximate real-time lip movement.

**Architecture:** FastAPI validates chat input, lazily transcribes optional audio with Faster Whisper on CPU, and calls Gemini with a bounded session history. React keeps onboarding media local, uses the existing browser speech utility for output, converts speech-boundary events into semantic mouth targets, and mutates Three.js morph weights without per-frame React renders. Chatterbox and Rhubarb remain honest, disabled capability adapters.

**Tech Stack:** React 19, Vite 6, Three.js 0.185, Anime.js 4.5, IndexedDB, Web Speech API, FastAPI, `google-genai` 2.x, Faster Whisper 1.x, optional Chatterbox TTS 0.1.7, Node test runner, pytest.

## Global Constraints

- Keep `GEMINI_API_KEY` on the FastAPI server.
- Use `gemini-3.1-flash-lite` for the active conversational model.
- Keep local Qwen, OpenVoice, active Chatterbox synthesis, and persistent chat memory out of scope.
- Keep onboarding photos and the optional voice reference on-device.
- Send at most eight recent text messages to Gemini.
- Use browser accessibility speech for active output and describe lip movement as approximate.
- Do not allocate Chatterbox VRAM or import its model unless an explicit future flag enables it.
- Target 60 FPS through `requestAnimationFrame`, direct morph refs, capped pixel ratio, visibility pausing, and resource disposal.
- Preserve typed chat when microphone, STT, WebGL, or browser speech is unavailable.
- Meet WCAG 2.2 AA, large touch targets, visible focus, written state labels, high-contrast mode, and reduced-motion behavior.
- Reuse the existing CSS, speech, local state, and IndexedDB patterns.
- Do not claim photo reconstruction, voice training, diagnosis, or exact phoneme timing.

---

### Task 1: Gemini Conversation Service

**Files:**
- Create: `backend/services/gemini_service.py`
- Create: `backend/tests/test_gemini_service.py`
- Modify: `backend/requirements.txt`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `GEMINI_API_KEY`, user text, and `list[dict[str, str]]` history.
- Produces: `GeminiService.configured: bool` and `GeminiService.generate_reply(text, history) -> str`.

- [ ] **Step 1: Write failing service tests**

```python
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
    assert [item["text"] for item in normalize_history(history)] == [str(index) for index in range(2, 10)]


def test_generate_reply_uses_configured_model():
    client = FakeClient()
    service = GeminiService(api_key="test", client=client)
    assert service.generate_reply("Hello", []) == "It is lovely to hear from you."
    assert client.models.request["model"] == "gemini-3.1-flash-lite"


def test_missing_key_is_not_configured():
    assert GeminiService(api_key="").configured is False
```

- [ ] **Step 2: Run tests and confirm the missing module failure**

Run: `python3 -m pytest backend/tests/test_gemini_service.py -q`

Expected: FAIL with `ModuleNotFoundError: backend.services.gemini_service`.

- [ ] **Step 3: Add the maintained Gemini SDK dependency**

Append to `backend/requirements.txt`:

```text
google-genai>=2.20.0,<3.0.0
```

Add `.venv/` to `.gitignore` so the documented local environment cannot enter source control.

- [ ] **Step 4: Implement the minimal Gemini service**

```python
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
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    def generate_reply(self, text, history):
        from google.genai import types
        contents = [
            types.Content(role=item["role"], parts=[types.Part(text=item["text"])])
            for item in normalize_history(history)
        ]
        contents.append(types.Content(role="user", parts=[types.Part(text=text)]))
        response = self._get_client().models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.4,
                max_output_tokens=180,
                http_options=types.HttpOptions(timeout=20_000),
            ),
        )
        reply = (response.text or "").strip()
        if not reply:
            raise RuntimeError("Gemini returned an empty response")
        return reply
```

- [ ] **Step 5: Run the focused tests**

Run: `python3 -m pytest backend/tests/test_gemini_service.py -q`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add .gitignore backend/requirements.txt backend/services/gemini_service.py backend/tests/test_gemini_service.py
git commit -m "feat(api): add Gemini conversation service"
```

---

### Task 2: CPU Speech Input and Chat Endpoint

**Files:**
- Create: `backend/services/stt_service.py`
- Create: `backend/tests/test_stt_service.py`
- Modify: `backend/app.py`
- Modify: `backend/tests/test_api.py`
- Modify: `backend/requirements.txt`

**Interfaces:**
- Consumes: optional UTF-8 text or an audio upload no larger than 10 MB.
- Produces: `WhisperTranscriber.available: bool`, `WhisperTranscriber.transcribe(data, content_type) -> str`, and `POST /api/chat/interact -> {inputText, text}`.

- [ ] **Step 1: Write failing transcriber and endpoint tests**

```python
import json
from fastapi.testclient import TestClient
from backend.app import app
from backend.services.stt_service import WhisperTranscriber


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
        return "Hello there"


def test_text_chat_returns_gemini_reply():
    app.state.gemini = FakeGemini()
    client = TestClient(app)
    response = client.post("/api/chat/interact", data={"text": "Hello there", "history": "[]"})
    assert response.status_code == 200
    assert response.json() == {
        "inputText": "Hello there",
        "text": "Hello. How are you feeling today?",
    }


def test_audio_chat_transcribes_on_cpu():
    app.state.gemini = FakeGemini()
    app.state.transcriber = FakeTranscriber()
    client = TestClient(app)
    response = client.post(
        "/api/chat/interact",
        data={"history": json.dumps([])},
        files={"audio": ("voice.webm", b"audio", "audio/webm")},
    )
    assert response.status_code == 200
    assert response.json()["inputText"] == "Hello there"


def test_whisper_defaults_to_cpu_int8():
    transcriber = WhisperTranscriber(model_factory=lambda *args, **kwargs: (args, kwargs))
    _, kwargs = transcriber._get_model()
    assert kwargs == {"device": "cpu", "compute_type": "int8"}
```

- [ ] **Step 2: Run tests and confirm failures**

Run: `python3 -m pytest backend/tests/test_stt_service.py backend/tests/test_api.py -q`

Expected: FAIL because the transcriber and new endpoint contract do not exist.

- [ ] **Step 3: Tighten the Faster Whisper version and implement lazy CPU transcription**

Change the dependency to `faster-whisper>=1.2.1,<2.0.0`, then create:

```python
import importlib.util
import os
import tempfile

SUFFIXES = {"audio/webm": ".webm", "audio/wav": ".wav", "audio/mpeg": ".mp3", "audio/ogg": ".ogg"}


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
        suffix = SUFFIXES.get(content_type)
        if not suffix:
            raise ValueError("Unsupported audio type")
        path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as file:
                file.write(data)
                path = file.name
            segments, _ = self._get_model().transcribe(path, vad_filter=True, beam_size=1)
            text = " ".join(segment.text.strip() for segment in segments).strip()
            if not text:
                raise ValueError("No speech detected")
            return text
        finally:
            if path:
                os.unlink(path)
```

- [ ] **Step 4: Replace the echo endpoint with validated Gemini orchestration**

In `backend/app.py`, initialize `app.state.gemini = GeminiService()` and `app.state.transcriber = WhisperTranscriber()`. Accept `text`, `audio`, and JSON-encoded `history`; reject both or neither, text over 2,000 characters, malformed history, unsupported audio, and audio over `10 * 1024 * 1024` bytes. Run blocking transcription and Gemini calls through `fastapi.concurrency.run_in_threadpool`.

Replace wildcard credentialed CORS with one explicit origin:

```python
allow_origins=[os.getenv("APP_ORIGIN", "http://localhost:3000")]
```

The success body must be exactly:

```python
return {"inputText": input_text, "text": reply}
```

Map missing Gemini configuration to HTTP 503, invalid input to HTTP 400 or 413, and provider failures to HTTP 502 with short stable messages.

- [ ] **Step 5: Run focused backend tests**

Run: `python3 -m pytest backend/tests/test_stt_service.py backend/tests/test_api.py -q`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/requirements.txt backend/app.py backend/services/stt_service.py backend/tests/test_stt_service.py backend/tests/test_api.py
git commit -m "feat(api): add speech input chat flow"
```

---

### Task 3: Honest Voice and Viseme Capabilities

**Files:**
- Create: `backend/requirements-voice.txt`
- Modify: `backend/services/tts_service.py`
- Modify: `backend/services/viseme_service.py`
- Modify: `backend/app.py`
- Modify: `backend/tests/test_api.py`

**Interfaces:**
- Consumes: `ENABLE_CHATTERBOX` and the optional `rhubarb` binary.
- Produces: capability flags, a disabled `/api/voice/enroll`, and `extract_rhubarb_visemes(path) -> list` without fabricated cues.

- [ ] **Step 1: Add failing capability tests**

```python
def test_health_reports_real_capabilities(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    response = client.get("/health")
    assert response.status_code == 200
    assert set(response.json()) == {
        "status", "geminiConfigured", "whisperAvailable", "chatterboxEnabled", "rhubarbAvailable"
    }


def test_voice_enrollment_is_disabled_and_writes_nothing(tmp_path):
    response = client.post(
        "/api/voice/enroll",
        data={"profile_id": "test-user"},
        files={"file": ("voice.wav", b"RIFF", "audio/wav")},
    )
    assert response.status_code == 503
    assert "disabled" in response.json()["detail"].lower()
    assert list(tmp_path.iterdir()) == []
```

- [ ] **Step 2: Run the tests and confirm the old fake implementation fails them**

Run: `python3 -m pytest backend/tests/test_api.py -q`

Expected: FAIL because health returns a VRAM string and enrollment stores a file.

- [ ] **Step 3: Add the optional Chatterbox dependency file**

```text
-r requirements.txt
chatterbox-tts==0.1.7
```

- [ ] **Step 4: Replace synthetic TTS with a disabled lazy adapter**

```python
import os


class VoiceCloningDisabled(RuntimeError):
    pass


class ChatterboxAdapter:
    @property
    def enabled(self):
        return os.getenv("ENABLE_CHATTERBOX") == "1"

    def enroll_voice(self, *_args, **_kwargs):
        raise VoiceCloningDisabled("Voice cloning is disabled")

    def synthesize_speech(self, *_args, **_kwargs):
        raise VoiceCloningDisabled("Voice cloning is disabled")
```

Do not import `torch` or `chatterbox` in this release.

- [ ] **Step 5: Remove heuristic viseme fabrication**

Keep the Rhubarb subprocess path, use `shutil.which("rhubarb")` for availability, and return `[]` when the binary is absent or fails. Delete the RMS loop and always unlink its temporary JSON file in `finally`.

- [ ] **Step 6: Update endpoints and health output**

`POST /api/voice/enroll` returns HTTP 503 without reading or storing the upload. `/health` derives each boolean from the live service objects and `shutil.which("rhubarb")`.

- [ ] **Step 7: Run backend tests**

Run: `python3 -m pytest backend/tests -q`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add backend/requirements-voice.txt backend/services/tts_service.py backend/services/viseme_service.py backend/app.py backend/tests/test_api.py
git commit -m "fix(voice): expose disabled capabilities"
```

---

### Task 4: Accessibility Speech Viseme Events

**Files:**
- Create: `src/utils/avatar/speechVisemes.js`
- Create: `tests/speechVisemes.test.js`
- Modify: `src/utils/speech.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: speech text, boundary character index, and lifecycle callbacks.
- Produces: `getBoundaryViseme(text, charIndex)`, `createSpeechVisemeEvents(setWeights, timers)`, and optional event callbacks from `speakText`.

- [ ] **Step 1: Write failing viseme event tests**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { getBoundaryViseme, createSpeechVisemeEvents } from '../src/utils/avatar/speechVisemes.js';

test('boundary vowels map to bounded mouth shapes', () => {
  assert.equal(getBoundaryViseme('A calm hello', 0), 'D');
  assert.equal(getBoundaryViseme('A calm hello', 7), 'E');
});

test('speech end returns the face to neutral', () => {
  const updates = [];
  const events = createSpeechVisemeEvents(weights => updates.push(weights), {
    setTimeout: callback => { callback(); return 1; },
    clearTimeout: () => {}
  });
  events.onBoundary({ charIndex: 0 }, 'A hello');
  events.onEnd();
  assert.equal(updates.at(-1).jawOpen, 0);
});
```

- [ ] **Step 2: Run the test and confirm the missing module failure**

Run: `node --test tests/speechVisemes.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement the smallest speech-to-viseme mapper**

Map vowel groups to the existing Rhubarb values and reuse `RHUBARB_MORPH_MAP`:

```javascript
import { RHUBARB_MORPH_MAP } from './visemeMapper.js';

export function getBoundaryViseme(text, charIndex = 0) {
  const token = text.slice(Math.max(0, charIndex)).match(/[a-z]+/i)?.[0]?.toLowerCase() || '';
  if (/[a]/.test(token)) return 'D';
  if (/[eiy]/.test(token)) return 'B';
  if (/[ou]/.test(token)) return 'E';
  return token ? 'C' : 'X';
}

export function createSpeechVisemeEvents(setWeights, timers = globalThis) {
  let neutralTimer;
  const neutral = () => setWeights({ ...RHUBARB_MORPH_MAP.X });
  return {
    onStart: () => setWeights({ ...RHUBARB_MORPH_MAP.C }),
    onBoundary: (event, text) => {
      timers.clearTimeout(neutralTimer);
      setWeights({ ...RHUBARB_MORPH_MAP[getBoundaryViseme(text, event.charIndex)] });
      neutralTimer = timers.setTimeout(neutral, 180);
    },
    onEnd: neutral,
    onError: neutral,
    dispose: () => { timers.clearTimeout(neutralTimer); neutral(); }
  };
}
```

- [ ] **Step 4: Extend the existing speech utility without breaking callers**

Change the signature to `speakText(text, onEnd = null, language = 'en', events = {})`. Assign `utterance.onstart`, `utterance.onboundary`, `utterance.onend`, and `utterance.onerror`; call the existing `onEnd` callback exactly once. Return the utterance when speech starts and `null` when unavailable.

- [ ] **Step 5: Add the new test to the existing npm test command and run it**

Run: `npm test`

Expected: all Node tests PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json src/utils/speech.js src/utils/avatar/speechVisemes.js tests/speechVisemes.test.js
git commit -m "feat(avatar): drive visemes from speech"
```

---

### Task 5: Licensed Avatar Asset and WebGL Lifecycle

**Files:**
- Create: `public/models/avatar-companion.vrm`
- Create: `public/models/avatar-companion.LICENSE.md`
- Modify: `src/components/avatar/AvatarCanvas.jsx`
- Modify: `src/utils/avatar/visemeMapper.js`
- Modify: `tests/visemeMapper.test.js`

**Interfaces:**
- Consumes: `/models/avatar-companion.vrm`, optional `textureUrl`, and a mutable `targetWeightsRef`.
- Produces: validated semantic morph aliases, a responsive renderer, and a static-avatar fallback callback.

- [ ] **Step 1: Add a failing alias-map test**

```javascript
import { resolveMorphIndex } from '../src/utils/avatar/visemeMapper.js';

test('semantic mouth targets resolve against the licensed VRM names', () => {
  const dictionary = {
    'Face_Blendshape.Fcl_MTH_A': 1,
    'Face_Blendshape.Fcl_MTH_U': 2,
    'Face_Blendshape.Fcl_EYE_Close_L': 3
  };
  assert.equal(resolveMorphIndex(dictionary, 'jawOpen'), 1);
  assert.equal(resolveMorphIndex(dictionary, 'mouthPucker'), 2);
  assert.equal(resolveMorphIndex(dictionary, 'eyeBlinkLeft'), 3);
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test tests/visemeMapper.test.js`

Expected: FAIL because `resolveMorphIndex` is missing.

- [ ] **Step 3: Add the verified pixiv sample asset**

Download `VRM1_Constraint_Twist_Sample.vrm` from the pixiv `three-vrm` repository as `public/models/avatar-companion.vrm` and verify:

```bash
sha256sum public/models/avatar-companion.vrm
```

Expected SHA-256: `12c2b97e95e700783a6a550dc0eee2d7880aeedccef9ae67bc4c5a2f0f2631a2`.

The license file records pixiv Inc., the repository source URL, the embedded VRM license metadata (`allowRedistribution: true`, `modification: allowModificationRedistribution`), and the repository MIT license. The UI and docs call it a licensed sample companion, not a generated likeness.

- [ ] **Step 4: Add semantic aliases**

Export a constant that maps the current internal names to the VRM target names:

```javascript
export const MORPH_ALIASES = {
  jawOpen: ['jawOpen', 'Face_Blendshape.Fcl_MTH_A', 'Face_Blendshape.Fcl_MTH_Large'],
  mouthPucker: ['mouthPucker', 'Face_Blendshape.Fcl_MTH_U'],
  mouthFunnel: ['mouthFunnel', 'Face_Blendshape.Fcl_MTH_O'],
  mouthSmile: ['mouthSmile', 'Face_Blendshape.Fcl_MTH_Joy'],
  mouthClose: ['mouthClose', 'Face_Blendshape.Fcl_MTH_Close'],
  eyeBlinkLeft: ['eyeBlinkLeft', 'Face_Blendshape.Fcl_EYE_Close_L'],
  eyeBlinkRight: ['eyeBlinkRight', 'Face_Blendshape.Fcl_EYE_Close_R']
};

export const resolveMorphIndex = (dictionary, name) =>
  MORPH_ALIASES[name]?.map(alias => dictionary[alias]).find(Number.isInteger);
```

- [ ] **Step 5: Replace per-render props with a mutable morph ref**

Change `AvatarCanvas` to accept `targetWeightsRef`, `textureUrl`, `reducedMotion`, and `onUnavailable`. Load `/models/avatar-companion.vrm` by default. Traverse every morph mesh, resolve aliases per mesh, and lerp its influences inside the animation loop. Do not store the active mesh in a React state value.

When `textureUrl` is present, load it through `THREE.TextureLoader`, set `flipY = false` and `colorSpace = THREE.SRGBColorSpace`, and apply it only to the face material. Preserve the model texture when the custom texture cannot load.

Cap `renderer.setPixelRatio` at `1.5`, pause scheduling while `document.hidden`, and dispose every traversed geometry, material, and texture during effect cleanup. If WebGL construction or GLTF loading fails, call `onUnavailable` and render no procedural substitute.

- [ ] **Step 6: Run frontend tests and production build**

Run: `npm test && npm run build`

Expected: PASS, with the VRM emitted as a public asset rather than bundled into JavaScript.

- [ ] **Step 7: Commit**

```bash
git add public/models src/components/avatar/AvatarCanvas.jsx src/utils/avatar/visemeMapper.js tests/visemeMapper.test.js
git commit -m "feat(avatar): add licensed morph model"
```

---

### Task 6: Local Avatar Onboarding

**Files:**
- Modify: `src/utils/mediaStore.js`
- Modify: `src/utils/avatar/cameraHelper.js`
- Modify: `src/components/avatar/AvatarOnboardingModal.jsx`
- Modify: `src/components/ProfileModal.jsx`
- Modify: `src/App.jsx`
- Modify: `tests/avatarOnboarding.test.js`

**Interfaces:**
- Consumes: three image blobs, appearance choices, and an optional audio blob.
- Produces: `putAvatarMedia(profile)`, `getAvatarMedia()`, `clearAvatarMedia()`, `createFaceTexture(frontBlob) -> Promise<Blob>`, and `onComplete({appearance})`.

- [ ] **Step 1: Add failing validation tests**

```javascript
import { validateAvatarMedia } from '../src/utils/avatar/cameraHelper.js';

test('avatar media requires three supported images but not voice', () => {
  const image = { type: 'image/jpeg', size: 1024 };
  assert.equal(validateAvatarMedia({ photos: { front: image, left: image, right: image } }), '');
  assert.match(validateAvatarMedia({ photos: { front: image } }), /three photos/i);
});

test('avatar media rejects oversized voice references', () => {
  const image = { type: 'image/jpeg', size: 1024 };
  const error = validateAvatarMedia({
    photos: { front: image, left: image, right: image },
    voiceBlob: { type: 'audio/webm', size: 9 * 1024 * 1024 }
  });
  assert.match(error, /8 MB/i);
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/avatarOnboarding.test.js`

Expected: FAIL because `validateAvatarMedia` is missing.

- [ ] **Step 3: Extend the existing IndexedDB database**

Open `cognitive-platform-media` at version 2 and add an `avatar` store keyed by `id`. Generalize the existing internal `requestFromStore(storeName, mode, run)` helper and preserve the `anchors` API. Store one record with `id: 'current'`, three blobs, derived texture blob, appearance choices, optional voice blob, and `updatedAt`.

- [ ] **Step 4: Implement strict local media validation**

Accept JPEG, PNG, and WebP photos no larger than 5 MB each. Accept an optional audio blob no larger than 8 MB. `validateAvatarMedia` returns a concrete user-facing error string or `''`.

- [ ] **Step 5: Create the local stylized face texture**

Implement `createFaceTexture(frontBlob)` with native Canvas APIs. Decode with `createImageBitmap`, center-crop to a square, draw at 512 by 512 pixels, apply `saturate(0.8) contrast(1.1)`, and encode WebP at quality `0.82`. Always close the decoded bitmap. Reject with `Unable to prepare avatar texture.` when decoding or encoding fails.

This is a fixed texture crop, not landmark detection or geometry reconstruction.

- [ ] **Step 6: Rebuild onboarding as a controlled four-step dialog**

Use normal project CSS classes, native file inputs, and `navigator.mediaDevices` only after the user chooses camera capture. Stop all media tracks when advancing, closing, or unmounting. Record for five seconds with an explicit consent checkbox; permit **Skip voice sample**.

Use Anime.js v4 `animate` for a 180 ms opacity and translate transition only when `prefers-reduced-motion` is false. The processing step says **Preparing your companion** and never says training, cloning, mesh extraction, or exact likeness.

- [ ] **Step 7: Remove the nested modal flow**

`ProfileModal` receives `onCreateAvatar` and closes before calling it. `App` owns `showAvatarOnboarding`, renders the onboarding dialog beside the profile dialog, saves returned appearance metadata into `platformState.profile.avatar3d`, and keeps large blobs in IndexedDB. `AvatarViewer` loads the current media record on mount, creates an object URL for `textureBlob`, and revokes it on cleanup.

- [ ] **Step 8: Run tests and build**

Run: `npm test && npm run build`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/utils/mediaStore.js src/utils/avatar/cameraHelper.js src/components/avatar/AvatarOnboardingModal.jsx src/components/ProfileModal.jsx src/App.jsx tests/avatarOnboarding.test.js
git commit -m "feat(avatar): save local onboarding media"
```

---

### Task 7: Companion Chat View

**Files:**
- Create: `src/utils/avatar/chatApi.js`
- Create: `tests/avatarChat.test.js`
- Modify: `src/components/avatar/AvatarViewer.jsx`
- Modify: `src/App.jsx`
- Modify: `package.json`

**Interfaces:**
- Consumes: text or recorded audio, eight recent messages, language, appearance, and the relative `/api/chat/interact` endpoint.
- Produces: a focused companion view with Ready, Listening, Thinking, Speaking, and Error states.

- [ ] **Step 1: Write failing request helper tests**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChatForm, trimHistory } from '../src/utils/avatar/chatApi.js';

test('history keeps eight safe text messages', () => {
  const history = Array.from({ length: 10 }, (_, index) => ({ role: 'user', text: String(index) }));
  assert.deepEqual(trimHistory(history).map(item => item.text), ['2','3','4','5','6','7','8','9']);
});

test('chat form never includes onboarding media', () => {
  const form = buildChatForm({ text: 'Hello', history: [], profileId: 'local' });
  assert.equal(form.get('text'), 'Hello');
  assert.equal(form.has('photos'), false);
  assert.equal(form.has('voiceBlob'), false);
});
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `node --test tests/avatarChat.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement the request helper**

`trimHistory` accepts only `{role: 'user'|'model', text: string}` and returns the last eight non-empty entries. `buildChatForm` adds exactly `text` or `audio`, serialized history, and `profile_id`. `sendChat` calls relative `/api/chat/interact`, parses JSON, and throws an `Error` containing the stable API detail on non-2xx responses.

- [ ] **Step 4: Rebuild `AvatarViewer` around the accessibility voice**

Keep `targetWeightsRef = useRef({})`. On a successful chat response:

1. append the submitted or transcribed user text and Gemini text to the visible transcript;
2. create speech-viseme callbacks targeting `targetWeightsRef.current`;
3. call `speakText(reply, finishSpeaking, language, callbacks)`;
4. expose **Stop speaking** through `stopSpeaking()` and callback disposal.

For microphone input, record WebM until the user presses **Stop recording**, then send the blob. Abort the active fetch and stop all media tracks when leaving the view. Preserve the unsent text after API failure and show **Try again**.

- [ ] **Step 5: Add the home entry point without changing primary navigation**

Add a labelled **Talk with your companion** action above the home category grid. It sets `activeView` to `companion`. Render `AvatarViewer` for that value and pass a **Return home** callback. Do not add a sixth `NAV_ITEMS` entry.

- [ ] **Step 6: Add the test to `npm test`, then run tests and build**

Run: `npm test && npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json src/utils/avatar/chatApi.js src/components/avatar/AvatarViewer.jsx src/App.jsx tests/avatarChat.test.js
git commit -m "feat(avatar): connect Gemini companion view"
```

---

### Task 8: Accessible Styling, Copy, and Motion

**Files:**
- Modify: `src/index.css`
- Modify: `src/data/i18n.js`
- Modify: `src/components/avatar/AvatarViewer.jsx`
- Modify: `src/components/avatar/AvatarOnboardingModal.jsx`
- Create: `tests/avatarCopy.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: existing font-size, high-contrast, reduced-motion, and language state.
- Produces: responsive companion/onboarding layouts and localized English plus Assamese core controls.

- [ ] **Step 1: Add failing copy tests**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { t } from '../src/data/i18n.js';

test('companion controls have English and Assamese labels', () => {
  for (const language of ['en', 'as']) {
    assert.notEqual(t(language, 'companion.send'), 'companion.send');
    assert.notEqual(t(language, 'companion.speak'), 'companion.speak');
    assert.notEqual(t(language, 'companion.returnHome'), 'companion.returnHome');
  }
});
```

- [ ] **Step 2: Run the test and confirm missing keys**

Run: `node --test tests/avatarCopy.test.js`

Expected: FAIL because the companion keys are absent.

- [ ] **Step 3: Add concise UI strings**

Add keys for the entry action, Ready, Listening, Thinking, Speaking, error, send, speak, stop recording, stop speaking, retry, return home, photo steps, optional local voice sample, skip voice, and save companion. English and Assamese are required; existing `t()` fallback covers the other languages until translated copy is supplied.

- [ ] **Step 4: Add project-native CSS**

Use a two-column companion layout that collapses below 850 px, minimum 48 px primary controls, 16 px minimum body copy, `:focus-visible`, stable transcript scrolling, and 12 to 16 px panel radii. Use green for primary state, amber for listening, blue for thinking, and red only for errors or stop actions. Status includes text and an icon.

Add:

```css
@media (prefers-reduced-motion: reduce) {
  .avatar-stage,
  .avatar-onboarding-step,
  .avatar-recording-indicator { animation: none !important; transition: none !important; }
}
```

Avoid gradient text, glass cards, decorative shadows, pulse animation, and utility-class strings.

- [ ] **Step 5: Run checks**

Run: `npm test && npm run build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json src/index.css src/data/i18n.js src/components/avatar/AvatarViewer.jsx src/components/avatar/AvatarOnboardingModal.jsx tests/avatarCopy.test.js
git commit -m "style(avatar): finish accessible companion UI"
```

---

### Task 9: End-to-End Verification and Documentation

**Files:**
- Modify: `tests/fullPipeline.test.js`
- Modify: `README.md`
- Modify: `public/sw.js`
- Modify: `tests/pwa.test.js`

**Interfaces:**
- Consumes: the completed frontend and backend flows.
- Produces: runnable setup instructions, lazy avatar asset caching, and final regression evidence.

- [ ] **Step 1: Replace the fake-audio pipeline test**

Test the active path: `buildChatForm` excludes onboarding media, a mocked response supplies Gemini text, `createSpeechVisemeEvents` produces a non-neutral mouth weight on boundary, and `onEnd` returns to neutral.

- [ ] **Step 2: Add lazy model caching**

Keep the 10.8 MB VRM out of the install-time shell. In the service worker fetch handler, cache successful same-origin requests under `/models/` after first use. Extend `tests/pwa.test.js` to assert the model is not in `APP_SHELL` and the runtime route exists.

- [ ] **Step 3: Document exact setup and feature boundaries**

Add these commands to `README.md`:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
export GEMINI_API_KEY='replace-with-your-key'
uvicorn backend.app:app --reload --port 8000
npm install
npm run dev
```

Document `WHISPER_MODEL=base`, the optional `pip install -r backend/requirements-voice.txt`, the disabled Chatterbox boundary, approximate browser-speech lip movement, local onboarding storage, Gemini text transmission, and the licensed pixiv sample asset.

- [ ] **Step 4: Install backend dependencies and run every automated check**

Run:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
npm test
npm run build
python -m pytest backend/tests -q
```

Expected: every command exits 0.

- [ ] **Step 5: Run the manual browser checklist**

Verify keyboard-only operation, visible focus, large text, high contrast, reduced motion, denied camera, photo upload fallback, denied microphone, typed chat, Gemini failure and retry, stop speaking, return home, WebGL fallback, and cleanup after repeatedly opening and closing the view.

- [ ] **Step 6: Commit**

```bash
git add README.md public/sw.js tests/fullPipeline.test.js tests/pwa.test.js
git commit -m "test(avatar): verify companion pipeline"
```
