# Apon Mon Cognitive Companion

Offline-first cognitive games and memory support for older adults, family caregivers, and ASHA workers in North East India. Built as a Smart India Hackathon prototype.

## Included

- 28 playable games across 10 cognitive categories and mild, moderate, and severe stages
- transparent local difficulty adjustment based on recent accuracy and hints
- five-game baseline, category trends, Memory Gap Map, and review flags
- daily check-ins, reminders, and an emergency `tel:` contact
- local family photos and voice notes through IndexedDB
- Family and ASHA dashboard views, printable report, and JSON export
- English interface plus an Assamese pilot pack
- installable PWA shell with offline game assets
- high contrast, large text, keyboard controls, read-aloud, and reduced motion
- optional Gemini companion with CPU speech input, browser accessibility voice, and a local 3D avatar

## Run checks

```bash
npm install
npm test
npm run build
```

## Gemini companion

The companion backend keeps the Gemini key outside the browser. From the project root:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
export GEMINI_API_KEY='replace-with-your-key'
uvicorn backend.app:app --reload --port 8000
```

In another terminal:

```bash
npm install
npm run dev
```

The Vite development server proxies `/api` to FastAPI on port 8000. `gemini-3.1-flash-lite` is the active conversational model. Optional microphone messages use Faster Whisper on CPU with `WHISPER_MODEL=base` unless another model is configured. The first transcription downloads the selected Whisper model.

Browser Speech Synthesis reads replies aloud. Mouth movement follows browser word-boundary events and is approximate; Rhubarb is not used for browser speech.

Chatterbox remains disabled and allocates no VRAM. Its optional dependency can be prepared separately with Python 3.11:

```bash
pip install -r backend/requirements-voice.txt
```

Installing it does not enable voice cloning or upload the optional local voice reference.

Development and preview servers are intentionally not started by automated agents in this repository.

## Local data

Settings, check-ins, reminders, results, and baselines use browser `localStorage`. Family photos, avatar onboarding photos, derived avatar texture, and optional voice clips use IndexedDB. The caregiver view can export structured data or delete all local data. Companion conversation history lasts only for the current view.

When the Gemini companion is used, the submitted or transcribed message and at most eight recent text messages are sent to Gemini. Avatar photos and voice samples are never included in that request. No account or cloud sync is included.

## Important boundary

This prototype supports cognitive engagement and care conversations. It does not diagnose dementia, replace clinical assessment, or automatically assign a clinical stage. SMS/IVR, geofencing, clinician systems, and telehealth cards are visibly marked demonstrations with no live service connection. The Gemini companion is live only when the local FastAPI service has a valid key and network connection.

## Browser support

Modern browsers with JavaScript, localStorage, and IndexedDB can run core features. WebGL, MediaRecorder, Speech Synthesis, notifications, PWA installation, and phone calling progressively enhance the experience when supported by the browser, operating system, and device. Typed companion chat and its transcript remain available when microphone, browser speech, or WebGL is unavailable. Assamese speech depends on an installed `as-IN` voice; on-screen text remains available without one.

The bundled VRM sample avatar is by pixiv Inc. Redistribution details and the pinned source are recorded in `public/models/avatar-companion.LICENSE.md`.
