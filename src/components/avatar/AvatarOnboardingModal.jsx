import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { animate, eases } from 'animejs';
import { Camera, CheckCircle, Mic, Square, Upload, X } from 'lucide-react';
import { createFaceTexture, validateAvatarMedia, validateVoiceSample } from '../../utils/avatar/cameraHelper.js';
import { putAvatarMedia } from '../../utils/mediaStore.js';

const AvatarCanvas = lazy(() => import('./AvatarCanvas.jsx'));

const ANGLES = ['front', 'left', 'right'];

export default function AvatarOnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState({ front: null, left: null, right: null });
  const [activeAngle, setActiveAngle] = useState('front');
  const [appearance, setAppearance] = useState({ skin: 'medium', hair: 'black' });
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [previewTexture, setPreviewTexture] = useState(null);
  const [recording, setRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const stepRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordStartedRef = useRef(0);
  const stopTimerRef = useRef();
  const tickTimerRef = useRef();
  const voiceConsentRef = useRef(false);

  const photoUrls = useMemo(() => Object.fromEntries(
    ANGLES.map(angle => [angle, photos[angle] ? URL.createObjectURL(photos[angle]) : ''])
  ), [photos]);
  const previewTextureUrl = useMemo(() => previewTexture ? URL.createObjectURL(previewTexture) : '', [previewTexture]);

  useEffect(() => () => Object.values(photoUrls).filter(Boolean).forEach(URL.revokeObjectURL), [photoUrls]);
  useEffect(() => () => { if (previewTextureUrl) URL.revokeObjectURL(previewTextureUrl); }, [previewTextureUrl]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const stopRecording = () => {
    clearTimeout(stopTimerRef.current);
    clearInterval(tickTimerRef.current);
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    recorderRef.current?.stream?.getTracks().forEach(track => track.stop());
    setRecording(false);
  };

  useEffect(() => () => {
    voiceConsentRef.current = false;
    stopCamera();
    stopRecording();
  }, []);

  useEffect(() => {
    if (!isOpen || !stepRef.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animate(stepRef.current, {
      opacity: { from: 0 },
      y: { from: 8 },
      duration: 180,
      ease: eases.outQuart
    });
  }, [isOpen, step]);

  useEffect(() => {
    if (!cameraActive || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => setError('Camera preview is unavailable. Choose a photo instead.'));
  }, [cameraActive, activeAngle]);

  useEffect(() => {
    if (step !== 2 || !photos.front) return;
    let active = true;
    createFaceTexture(photos.front)
      .then(texture => { if (active) setPreviewTexture(texture); })
      .catch(textureError => { if (active) setError(textureError.message); });
    return () => { active = false; };
  }, [step, photos.front]);

  if (!isOpen) return null;

  const closeDialog = () => {
    voiceConsentRef.current = false;
    stopCamera();
    stopRecording();
    setStep(0);
    setPhotos({ front: null, left: null, right: null });
    setVoiceConsent(false);
    setVoiceBlob(null);
    setVoiceDuration(0);
    setPreviewTexture(null);
    setProcessing(false);
    setError('');
    onClose();
  };

  const startCamera = async angle => {
    setError('');
    stopCamera();
    setActiveAngle(angle);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      setError('Camera is unavailable. Choose a photo from this device instead.');
    }
  };

  const setPhoto = (angle, blob) => {
    if (!blob) return;
    setPhotos(current => ({ ...current, [angle]: blob }));
    setError('');
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0, 640, 480);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    setPhoto(activeAngle, blob);
    stopCamera();
  };

  const startRecording = async () => {
    if (!voiceConsent) return;
    setError('');
    chunksRef.current = [];
    setVoiceBlob(null);
    setVoiceDuration(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = event => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const duration = Math.min(5, (Date.now() - recordStartedRef.current) / 1000);
        stream.getTracks().forEach(track => track.stop());
        if (!voiceConsentRef.current) return;
        setVoiceDuration(duration);
        setVoiceBlob(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
      };
      recordStartedRef.current = Date.now();
      recorder.start();
      setRecording(true);
      tickTimerRef.current = setInterval(() => {
        setVoiceDuration(Math.min(5, (Date.now() - recordStartedRef.current) / 1000));
      }, 250);
      stopTimerRef.current = setTimeout(stopRecording, 5000);
    } catch {
      setError('Microphone is unavailable. You can save without a voice sample.');
    }
  };

  const saveAvatar = async () => {
    const savedVoice = voiceConsent ? voiceBlob : null;
    if (savedVoice && !validateVoiceSample(voiceDuration)) {
      setError('Record for five seconds, or remove the optional voice sample.');
      return;
    }
    const validationError = validateAvatarMedia({ photos, voiceBlob: savedVoice });
    if (validationError) {
      setError(validationError);
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const textureBlob = previewTexture || await createFaceTexture(photos.front);
      await putAvatarMedia({ photos, textureBlob, appearance, voiceBlob: savedVoice });
      await onComplete?.({ appearance });
      closeDialog();
    } catch (saveError) {
      setError(saveError.message || 'Unable to save this companion.');
      setProcessing(false);
    }
  };

  const photoInput = angle => (
    <label className="avatar-file-action">
      <Upload size={20} aria-hidden="true" /> Choose {angle} photo
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={event => setPhoto(angle, event.target.files?.[0])}
      />
    </label>
  );

  const changeVoiceConsent = checked => {
    voiceConsentRef.current = checked;
    setVoiceConsent(checked);
    if (!checked) {
      stopRecording();
      setVoiceBlob(null);
      setVoiceDuration(0);
    }
  };

  return (
    <div className="avatar-onboarding-backdrop">
      <section className="avatar-onboarding-dialog" role="dialog" aria-modal="true" aria-labelledby="avatar-onboarding-title">
        <header className="avatar-onboarding-header">
          <div>
            <h2 id="avatar-onboarding-title">Prepare your companion</h2>
            <p>Photos stay on this device.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={closeDialog} aria-label="Close avatar setup">
            <X size={24} />
          </button>
        </header>

        <ol className="avatar-step-list" aria-label="Avatar setup progress">
          {['Front photo', 'Side photos', 'Review', 'Voice option'].map((label, index) => (
            <li key={label} className={step === index ? 'active' : step > index ? 'complete' : ''}>
              {step > index ? <CheckCircle size={18} aria-hidden="true" /> : <span>{index + 1}</span>}
              {label}
            </li>
          ))}
        </ol>

        <div ref={stepRef} className="avatar-onboarding-step">
          {step === 0 && (
            <>
              <h3>Add a clear front photo</h3>
              <p>Face the camera in even light. Glasses are fine.</p>
              {photoUrls.front && <img className="avatar-photo-preview avatar-photo-preview-large" src={photoUrls.front} alt="Front photo preview" />}
              {cameraActive && activeAngle === 'front' && <video ref={videoRef} className="avatar-camera-preview" autoPlay playsInline muted />}
              <div className="avatar-action-row">
                <button type="button" className="avatar-secondary-btn" onClick={() => startCamera('front')}><Camera size={20} /> Use camera</button>
                {cameraActive && <button type="button" className="avatar-primary-btn" onClick={capturePhoto}>Take front photo</button>}
                {photoInput('front')}
              </div>
              <button type="button" className="avatar-primary-btn avatar-next-btn" disabled={!photos.front} onClick={() => setStep(1)}>Continue to side photos</button>
            </>
          )}

          {step === 1 && (
            <>
              <h3>Add left and right photos</h3>
              <p>Turn about 45 degrees. Keep your whole face visible.</p>
              <div className="avatar-side-grid">
                {['left', 'right'].map(angle => (
                  <article key={angle} className="avatar-angle-panel">
                    <h4>{angle === 'left' ? 'Left side' : 'Right side'}</h4>
                    {photoUrls[angle] ? <img className="avatar-photo-preview" src={photoUrls[angle]} alt={`${angle} photo preview`} /> : <div className="avatar-photo-placeholder"><Camera size={28} /></div>}
                    <button type="button" className="avatar-secondary-btn" onClick={() => startCamera(angle)}>Use camera</button>
                    {photoInput(angle)}
                  </article>
                ))}
              </div>
              {cameraActive && activeAngle !== 'front' && (
                <div className="avatar-live-capture">
                  <video ref={videoRef} className="avatar-camera-preview" autoPlay playsInline muted />
                  <button type="button" className="avatar-primary-btn" onClick={capturePhoto}>Take {activeAngle} photo</button>
                </div>
              )}
              <div className="avatar-action-row avatar-footer-actions">
                <button type="button" className="avatar-secondary-btn" onClick={() => setStep(0)}>Back</button>
                <button type="button" className="avatar-primary-btn" disabled={!photos.left || !photos.right} onClick={() => { stopCamera(); setStep(2); }}>Review photos</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3>Review the companion appearance</h3>
              <p>The fixed cartoon model uses your front photo as a local texture. It does not reconstruct your face.</p>
              <div className="avatar-review-grid">
                {ANGLES.map(angle => <img key={angle} src={photoUrls[angle]} alt={`${angle} view`} />)}
              </div>
              <div className="avatar-onboarding-preview">
                {previewTextureUrl ? (
                  <Suspense fallback={<p>Preparing 3D preview…</p>}>
                    <AvatarCanvas textureUrl={previewTextureUrl} />
                  </Suspense>
                ) : <p>Preparing 3D preview…</p>}
              </div>
              <div className="avatar-appearance-fields">
                <label>Skin tone<select value={appearance.skin} onChange={event => setAppearance(current => ({ ...current, skin: event.target.value }))}><option value="light">Light</option><option value="medium">Medium</option><option value="deep">Deep</option></select></label>
                <label>Hair tone<select value={appearance.hair} onChange={event => setAppearance(current => ({ ...current, hair: event.target.value }))}><option value="silver">Silver</option><option value="black">Black</option><option value="brown">Brown</option></select></label>
              </div>
              <div className="avatar-action-row avatar-footer-actions">
                <button type="button" className="avatar-secondary-btn" onClick={() => setStep(1)}>Retake photos</button>
                <button type="button" className="avatar-primary-btn" onClick={() => setStep(3)}>Continue to voice option</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3>Optional voice reference</h3>
              <p>Voice cloning is not active. A five-second sample can be saved locally for a future caregiver-enabled feature.</p>
              <label className="avatar-consent-row">
                <input type="checkbox" checked={voiceConsent} onChange={event => changeVoiceConsent(event.target.checked)} />
                Save this voice sample only on this device
              </label>
              <div className="avatar-recording-controls">
                <button type="button" className={recording ? 'avatar-stop-btn' : 'avatar-secondary-btn'} disabled={!voiceConsent && !recording} onClick={recording ? stopRecording : startRecording}>
                  {recording ? <Square size={20} /> : <Mic size={20} />}
                  {recording ? 'Stop recording' : 'Record five seconds'}
                </button>
                <span aria-live="polite">{recording ? `Recording ${voiceDuration.toFixed(1)} of 5 seconds` : voiceBlob ? `Saved ${voiceDuration.toFixed(1)} second sample` : 'No voice sample saved'}</span>
                {voiceBlob && <button type="button" className="avatar-text-btn" onClick={() => { setVoiceBlob(null); setVoiceDuration(0); }}>Remove voice sample</button>}
              </div>
              <div className="avatar-action-row avatar-footer-actions">
                <button type="button" className="avatar-secondary-btn" onClick={() => setStep(2)}>Back</button>
                <button type="button" className="avatar-primary-btn" disabled={processing} onClick={saveAvatar}>{processing ? 'Preparing companion…' : 'Save companion'}</button>
              </div>
            </>
          )}
        </div>

        {error && <p className="avatar-error" role="alert">{error}</p>}
      </section>
    </div>
  );
}
