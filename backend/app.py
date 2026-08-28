from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import shutil
from backend.services.tts_service import VoiceCloneEngine
from backend.services.viseme_service import extract_rhubarb_visemes

app = FastAPI(title="Avatar Voice & Lip-Sync Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tts_engine = VoiceCloneEngine()
static_audio_dir = os.path.join(os.path.dirname(__file__), "static", "audio")
os.makedirs(static_audio_dir, exist_ok=True)
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.post("/api/voice/enroll")
async def enroll_voice(profile_id: str = Form(...), file: UploadFile = File(...)):
    contents = await file.read()
    path = tts_engine.enroll_voice(profile_id, contents)
    return {"status": "enrolled", "profile_id": profile_id, "ref_path": path}

@app.post("/api/chat/interact")
async def chat_interact(text: str = Form(...), profile_id: str = Form("default")):
    wav_path = tts_engine.synthesize_speech(text, profile_id)
    static_filename = f"speech_{os.path.basename(wav_path)}"
    dest = os.path.join(static_audio_dir, static_filename)
    shutil.copy(wav_path, dest)
    
    visemes = extract_rhubarb_visemes(wav_path)
    audio_url = f"/static/audio/{static_filename}"
    
    return {
        "text": text,
        "audioUrl": audio_url,
        "visemes": visemes
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "gpu_vram_limit": "6GB"}
