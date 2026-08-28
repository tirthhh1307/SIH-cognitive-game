# 3D Cartoon Avatar Companion Design

## Goal

Add a calm, accessible 3D companion to Apon Mon. The first release uses Gemini for conversation, CPU Faster Whisper for optional speech input, the browser accessibility voice for speech output, and approximate real-time lip movement driven by browser speech-boundary events.

The release must be honest about its limits. Chatterbox voice cloning and Rhubarb audio-timed visemes are installed as future integration points but are not active. Multi-angle photos personalize a fixed, pre-rigged cartoon avatar; they do not reconstruct a new head or body mesh.

## Decisions

- Use `gemini-3.1-flash-lite` through the current Google Gen AI Python SDK.
- Keep `GEMINI_API_KEY` on the FastAPI server.
- Do not ship local Qwen in this release.
- Use the existing browser accessibility voice for active speech output.
- Approximate lip movement from `SpeechSynthesisUtterance` boundary events.
- Add Chatterbox as an optional, lazy-loaded adapter, disabled by default.
- Keep Rhubarb support dormant until generated audio replaces browser speech.
- Use a bundled, openly licensed, pre-rigged GLB. Record its source, author, license, and modifications in the repository.
- Keep photos, optional voice reference, and conversation state on the device. Only bounded conversation text is sent to Gemini.
- Use Anime.js only for short onboarding state changes and recording feedback.

## Current State

The repository already contains files named for the avatar pipeline, but they are a demo scaffold:

- voice enrollment writes an uploaded file to a temporary path without creating a speaker embedding;
- speech synthesis creates a sine wave instead of cloned speech;
- chat echoes submitted text instead of calling an LLM;
- Faster Whisper is absent;
- onboarding completion is only logged;
- the avatar GLB is absent;
- `AvatarViewer` is not connected to an application surface;
- per-frame lip weights currently pass through React state.

The implementation will replace these demo boundaries without disturbing the existing cognitive-game flows.

## User Experience

### Entry point

The home screen gains one prominent, labelled action: **Talk with your companion**. It opens a focused companion view without adding a sixth primary navigation destination. Returning home is always available through a large labelled control.

The Three.js renderer loads only after the companion view opens. The normal home screen continues to use the existing static profile image and does not pay the WebGL startup cost.

### Companion view

Desktop layout places the avatar and conversation transcript side by side. Narrow layouts stack the avatar above the transcript and controls.

The interface provides:

- a permanent text transcript;
- a standard text field and **Send message** button;
- a large **Speak** button for microphone input;
- a **Stop speaking** control while browser speech is active;
- a **Return home** control;
- written Ready, Listening, Thinking, Speaking, and Error states.

Controls meet the project's large-target and focus-visibility requirements. Typed chat remains usable when camera, microphone, speech recognition, WebGL, or browser speech is unavailable.

### Onboarding

Avatar onboarding remains a focused dialog because camera capture is a contained, interruptible task. It presents one decision at a time:

1. Capture or upload a front photo.
2. Capture or upload left and right 45-degree photos.
3. Review the generated appearance and adjust the available skin, hair, and accessory presets.
4. Optionally record a voice reference after explicit consent.

Camera failure exposes standard file inputs. The voice step clearly states that cloning is not active, the sample remains on this device, and skipping it does not reduce current functionality.

### Visual and motion treatment

The new surfaces reuse Apon Mon's existing green, amber, typography, focus, and control vocabulary. They use project CSS classes rather than unconfigured Tailwind utilities.

Avatar motion communicates state:

- subtle idle breathing and occasional blinking while ready;
- a small listening posture change during microphone capture;
- mouth movement while the accessibility voice speaks;
- no decorative page-load choreography.

Anime.js transitions onboarding content over 150 to 250 milliseconds with non-bouncy easing. Reduced-motion mode removes onboarding movement and idle breathing. Speech-related mouth movement remains because it communicates active audio, but its amplitude is reduced.

## Avatar Asset and Personalization

The implementation will select a CC0, CC-BY, or similarly redistributable cartoon GLB only after verifying its license and morph-target inventory. The repository must include attribution and a machine-readable or text license alongside the asset.

The base model supplies geometry, rigging, UV layout, and facial targets. A load-time validator reports which required targets are present. The active Rhubarb-style mapping uses a subset such as `jawOpen`, `mouthPucker`, `mouthFunnel`, `mouthSmileLeft`, `mouthSmileRight`, `mouthClose`, `eyeBlinkLeft`, and `eyeBlinkRight`. Additional ARKit targets remain available for later expression work.

Photo personalization is local and deterministic:

- the front image is cropped to the model's known face-texture template;
- Canvas applies a restrained cartoon treatment and creates the model texture;
- side photos guide caregiver-adjustable appearance presets but do not generate geometry;
- the user sees a preview before saving;
- if texture generation fails, the base model and manual presets remain usable.

The product must never claim that it reconstructed a face, trained a model, or created an exact likeness.

If no suitable redistributable GLB has the required facial targets, implementation pauses at the asset boundary rather than silently substituting an incompatible model. The existing static avatar remains the accessible fallback.

## Frontend Architecture

### `AvatarViewer`

`AvatarViewer` owns the companion presentation, transcript, input controls, state labels, and interaction lifecycle. It sends text or recorded audio to the backend, starts browser speech for successful responses, and stops speech when unmounted or explicitly cancelled.

Recent conversation state is session-only. At most eight recent user and assistant messages are sent with each request. Reloading the application clears the chat.

### `AvatarCanvas`

`AvatarCanvas` owns Three.js scene creation, GLB loading, morph-target validation, texture application, rendering, resizing, visibility pausing, and disposal.

Lip weights do not flow through React state every frame. Speech events update a mutable target-weight ref. The Three.js animation loop interpolates the displayed weights toward those targets and resets them to neutral between boundaries and when speech ends.

The renderer uses `requestAnimationFrame`, caps device pixel ratio, pauses when the document is hidden, and disposes renderer, textures, materials, geometries, listeners, and animation handles on cleanup. Sixty frames per second is the target on the stated RTX 3050 device, not an unconditional browser guarantee.

### Speech timing

The existing speech utility is extended instead of creating a second browser-speech wrapper. It accepts optional boundary, start, end, and error callbacks while preserving current callers.

Boundary events select approximate Rhubarb-compatible visemes from word position and vowel/consonant groups. Browsers that do not emit boundary events use a conservative timed jaw animation while speech is active. This approximation is visibly described in developer documentation, not presented as phoneme-accurate Rhubarb output.

### Onboarding storage

Captured photos, derived texture, appearance choices, and optional voice reference use the existing IndexedDB media-storage pattern. The profile stored in local storage contains only small identifiers and appearance settings, never large media blobs.

## Backend Architecture

### `POST /api/chat/interact`

The endpoint accepts multipart form data:

- `text`, optional when `audio` is supplied;
- `audio`, optional when `text` is supplied;
- `history`, a JSON-encoded list of at most eight previous messages;
- `profile_id`, used only for local request association.

Exactly one of `text` or `audio` is required. Inputs have explicit size and length limits. The server rejects malformed history, unsupported audio types, oversized uploads, and empty requests.

When audio is supplied, a lazily loaded Faster Whisper model transcribes it on CPU with GPU use disabled. The resulting text is sent to Gemini with the bounded history and a system instruction that enforces calm language, short responses, no dementia diagnosis, and escalation to a caregiver or qualified clinician for medical decisions.

The response contains:

```json
{
  "inputText": "transcribed or submitted text",
  "text": "Gemini response text"
}
```

No synthetic audio or fabricated viseme data is returned while browser speech is active.

### Gemini client

The backend uses the maintained `google-genai` package. `GEMINI_API_KEY` is read from the environment and never returned to or embedded in the frontend. The client is initialized lazily so `/health` and non-AI tests work without a key.

Gemini requests use a bounded timeout. Provider errors are converted into stable API errors without leaking secrets or raw provider payloads.

### Chatterbox adapter

Chatterbox lives in a separate optional requirements file because normal development and the active accessibility-voice path do not need its large PyTorch dependency tree.

The adapter exposes the future enrollment and synthesis boundary but does not load a model or process audio unless `ENABLE_CHATTERBOX=1`. In this release that flag is documented as unsupported. `POST /api/voice/enroll` returns a clear disabled response and stores nothing.

The future adapter uses a reference-audio path and retains Chatterbox's built-in watermarking. Its presence must not allocate VRAM during application startup.

### Rhubarb adapter

Rhubarb extraction remains available for a future generated WAV pipeline. It is not called by the active Gemini and browser-speech flow. Temporary output files are removed on success and failure. If the binary is absent, capability reporting states that fact instead of generating arbitrary cycling visemes.

### `GET /health`

Health output reports real capability flags rather than estimated memory claims:

```json
{
  "status": "ok",
  "geminiConfigured": true,
  "whisperAvailable": true,
  "chatterboxEnabled": false,
  "rhubarbAvailable": false
}
```

## Privacy and Safety

- Gemini receives only bounded conversation text, never onboarding photos or the optional voice reference.
- Voice and photo collection requires explicit, plain-language consent.
- Local media can be reviewed and deleted through existing local-data controls.
- Backend logs omit conversation text, audio content, API keys, and local media paths.
- File type, filename, size, and request fields are validated at the API boundary.
- Gemini output is treated as untrusted text and rendered without HTML injection.
- Companion copy states that the feature supports conversation and activities but does not diagnose dementia or replace clinical care.

## Error Handling

- Missing Gemini configuration returns a retryable service-unavailable response with setup guidance.
- Gemini timeout or network failure preserves the user's message and offers **Try again**.
- Microphone denial or missing media APIs keeps typed input active.
- STT failure keeps the recording local until the user retries or deletes it.
- Browser speech failure leaves the response visible and provides **Read aloud again** when supported.
- GLB or WebGL failure shows the existing static avatar with the same transcript and controls.
- Incompatible morph targets produce a developer warning and neutral mouth state, not a crash.
- Closing the view stops recording, speech, animation frames, media tracks, and pending requests.

## Verification

Frontend checks use the existing Node test runner:

- Rhubarb-to-ARKit mapping clamps and interpolates weights.
- browser speech boundary events select and reset approximate visemes;
- the no-boundary fallback produces bounded, neutral-ending mouth motion;
- onboarding requires three valid images but never requires the optional voice sample;
- onboarding media is stored locally and never included in a Gemini request;
- companion request state handles success, retry, cancellation, and microphone denial;
- WebGL lifecycle helpers cancel frames and release registered resources;
- the full mocked text flow reaches Gemini response handling, browser speech callbacks, and avatar target weights.

Backend checks use pytest with Gemini, Faster Whisper, Chatterbox, and Rhubarb mocked:

- `/health` reports detected capabilities;
- text chat validates and sends bounded history;
- audio chat validates input and uses CPU transcription;
- missing Gemini configuration and provider failures return stable errors;
- voice enrollment remains disabled and writes no file;
- Rhubarb cleanup works and absence does not fabricate visemes.

Completion requires the existing `npm test`, `npm run build`, and backend test suite to pass. A manual browser pass verifies keyboard navigation, focus order, large text, high contrast, reduced motion, camera fallback, microphone denial, WebGL fallback, and conversational playback.

## Out of Scope

- local Qwen inference;
- active Chatterbox synthesis or claimed voice cloning;
- OpenVoice;
- phoneme-accurate Rhubarb timing for browser accessibility speech;
- photogrammetry, learned 3D reconstruction, or automatic rig generation;
- cloud storage, accounts, cross-device history, or persistent conversational memory;
- medical advice, diagnosis, or automated cognitive-stage changes.

