import React, { useState, useRef } from 'react';
import { Camera, Mic, CheckCircle, RefreshCw, X } from 'lucide-react';
import { validatePhotoSet, validateVoiceSample } from '../../utils/avatar/cameraHelper.js';

export default function AvatarOnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1); // 1: Photos, 2: Voice, 3: Processing
  const [photos, setPhotos] = useState({ front: null, left: null, right: null });
  const [activeAngle, setActiveAngle] = useState('front');
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  if (!isOpen) return null;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const updated = { ...photos, [activeAngle]: dataUrl };
    setPhotos(updated);

    if (activeAngle === 'front') setActiveAngle('left');
    else if (activeAngle === 'left') setActiveAngle('right');
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setRecordTime(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
      };
      mediaRecorderRef.current.start();
      setRecording(true);

      const interval = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= 6) {
            clearInterval(interval);
            stopRecording();
            return 6;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Mic access error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleFinish = async () => {
    setStep(3);
    const payload = { photos, audioBlob };
    if (onComplete) await onComplete(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-emerald-900 border border-emerald-700 rounded-3xl p-6 text-white shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10" aria-label="Close">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-amber-200 mb-2">Create Your 3D Companion</h2>
        <p className="text-sm text-emerald-200 mb-6">Take 3 photos and record 5 seconds of speech to clone your avatar.</p>

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex justify-around gap-2 text-center text-xs">
              {['front', 'left', 'right'].map((ang) => (
                <button
                  key={ang}
                  onClick={() => setActiveAngle(ang)}
                  className={`px-3 py-1.5 rounded-full capitalize font-semibold border ${
                    activeAngle === ang ? 'bg-amber-400 text-emerald-950 border-amber-300' : 'bg-emerald-800/60 border-emerald-600'
                  }`}
                >
                  {ang} {photos[ang] && '✓'}
                </button>
              ))}
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border border-emerald-700">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" onLoadedMetadata={startCamera} />
            </div>

            <div className="flex gap-3">
              <button onClick={capturePhoto} className="flex-1 py-3 bg-amber-400 text-emerald-950 font-bold rounded-2xl hover:bg-amber-300 flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" /> Snap {activeAngle} Photo
              </button>
              {validatePhotoSet(photos) && (
                <button onClick={() => setStep(2)} className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-400">
                  Next →
                </button>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-800/50 rounded-2xl border border-emerald-600">
              <p className="text-sm text-amber-100 font-medium mb-2">Please read aloud:</p>
              <p className="text-lg italic font-serif">"The warm sun shines brightly across the green tea gardens of Assam today."</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  recording ? 'bg-red-500 animate-pulse scale-110' : 'bg-amber-400 hover:bg-amber-300 text-emerald-950'
                }`}
              >
                <Mic className="w-8 h-8" />
              </button>
              <span className="text-sm font-semibold">{recording ? `Recording: ${recordTime}s / 5s` : audioBlob ? 'Recorded! Ready to generate' : 'Tap to record 5s'}</span>
            </div>

            {audioBlob && (
              <button onClick={handleFinish} className="w-full py-3.5 bg-amber-400 text-emerald-950 font-bold rounded-2xl hover:bg-amber-300">
                Generate 3D Avatar & Cloned Voice
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="py-12 flex flex-col items-center gap-4 text-center">
            <RefreshCw className="w-12 h-12 text-amber-400 animate-spin" />
            <h3 className="text-xl font-bold text-amber-200">Building 3D Mesh & Training Voice...</h3>
            <p className="text-xs text-emerald-200">Extracting 52 ARKit blendshapes & speaker embedding.</p>
          </div>
        )}
      </div>
    </div>
  );
}
