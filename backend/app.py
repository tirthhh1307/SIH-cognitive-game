import json
import os

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware

from backend.services.gemini_service import GeminiService
from backend.services.stt_service import SUFFIXES, WhisperTranscriber
from backend.services.tts_service import VoiceCloneEngine


MAX_AUDIO_BYTES = 10 * 1024 * 1024
MAX_TEXT_LENGTH = 2000

app = FastAPI(title="Avatar Voice & Lip-Sync Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("APP_ORIGIN", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tts_engine = VoiceCloneEngine()
app.state.gemini = GeminiService()
app.state.transcriber = WhisperTranscriber()

@app.post("/api/voice/enroll")
async def enroll_voice(profile_id: str = Form(...), file: UploadFile = File(...)):
    contents = await file.read()
    path = tts_engine.enroll_voice(profile_id, contents)
    return {"status": "enrolled", "profile_id": profile_id, "ref_path": path}

@app.post("/api/chat/interact")
async def chat_interact(
    request: Request,
    text: str | None = Form(None),
    audio: UploadFile | None = File(None),
    history: str = Form("[]"),
    profile_id: str = Form("default"),
):
    del profile_id
    submitted_text = (text or "").strip()
    if bool(submitted_text) == bool(audio):
        raise HTTPException(status_code=400, detail="Provide text or audio, but not both.")
    if len(submitted_text) > MAX_TEXT_LENGTH:
        raise HTTPException(status_code=400, detail="Message must be 2000 characters or fewer.")

    try:
        parsed_history = json.loads(history)
    except json.JSONDecodeError as error:
        raise HTTPException(status_code=400, detail="History must be valid JSON.") from error
    if not isinstance(parsed_history, list):
        raise HTTPException(status_code=400, detail="History must be a list.")

    input_text = submitted_text
    if audio:
        media_type = (audio.content_type or "").split(";", 1)[0].lower()
        if media_type not in SUFFIXES:
            raise HTTPException(status_code=400, detail="Unsupported audio type.")
        contents = await audio.read(MAX_AUDIO_BYTES + 1)
        if len(contents) > MAX_AUDIO_BYTES:
            raise HTTPException(status_code=413, detail="Audio must be 10 MB or smaller.")
        try:
            input_text = await run_in_threadpool(
                request.app.state.transcriber.transcribe,
                contents,
                audio.content_type,
            )
        except ValueError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error
        except Exception as error:
            raise HTTPException(status_code=502, detail="Speech transcription failed.") from error

    if not request.app.state.gemini.configured:
        raise HTTPException(status_code=503, detail="Gemini is not configured.")
    try:
        reply = await run_in_threadpool(
            request.app.state.gemini.generate_reply,
            input_text,
            parsed_history,
        )
    except Exception as error:
        raise HTTPException(status_code=502, detail="Companion response failed.") from error
    return {"inputText": input_text, "text": reply}

@app.get("/health")
def health_check():
    return {"status": "ok", "gpu_vram_limit": "6GB"}
