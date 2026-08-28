import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Mic, RotateCcw, Send, Square, VolumeX } from 'lucide-react';
import AvatarCanvas from './AvatarCanvas.jsx';
import { sendChat } from '../../utils/avatar/chatApi.js';
import { createSpeechVisemeEvents } from '../../utils/avatar/speechVisemes.js';
import { getAvatarMedia } from '../../utils/mediaStore.js';
import { speakText, stopSpeaking } from '../../utils/speech.js';
import { t } from '../../data/i18n.js';

export default function AvatarViewer({
  language = 'en',
  profileId = 'local',
  staticAvatar = '/avatars/avatar_apoi.jpg',
  onReturnHome
}) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('ready');
  const [error, setError] = useState('');
  const [failedPayload, setFailedPayload] = useState(null);
  const [recording, setRecording] = useState(false);
  const [textureUrl, setTextureUrl] = useState('');
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const targetWeightsRef = useRef({});
  const abortRef = useRef();
  const streamRef = useRef();
  const recorderRef = useRef();
  const chunksRef = useRef([]);
  const speechEventsRef = useRef();
  const discardRecordingRef = useRef(false);
  const disposedRef = useRef(false);
  const copy = key => t(language, `companion.${key}`);

  useEffect(() => {
    let objectUrl;
    getAvatarMedia().then(record => {
      if (!disposedRef.current && record?.textureBlob) {
        objectUrl = URL.createObjectURL(record.textureBlob);
        setTextureUrl(objectUrl);
      }
    }).catch(() => {});
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, []);

  useEffect(() => {
    const query = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return undefined;
    const update = event => setReducedMotion(event.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    disposedRef.current = false;
    return () => {
      disposedRef.current = true;
      abortRef.current?.abort();
      discardRecordingRef.current = true;
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      stopSpeaking();
      speechEventsRef.current?.dispose();
    };
  }, []);

  const finishSpeaking = () => {
    speechEventsRef.current?.onEnd();
    if (disposedRef.current) return;
    setStatus('ready');
  };

  const readReply = text => {
    speechEventsRef.current?.dispose();
    const events = createSpeechVisemeEvents(weights => { targetWeightsRef.current = weights; });
    speechEventsRef.current = events;
    setStatus('speaking');
    speakText(text, finishSpeaking, language, events);
  };

  const submitPayload = async payload => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('thinking');
    setError('');
    setFailedPayload(null);
    try {
      const result = await sendChat(
        { ...payload, history: messages, profileId },
        { signal: controller.signal }
      );
      if (disposedRef.current) return;
      setMessages(current => [
        ...current,
        { role: 'user', text: result.inputText },
        { role: 'model', text: result.text }
      ]);
      readReply(result.text);
    } catch (requestError) {
      if (requestError.name === 'AbortError' || disposedRef.current) return;
      setStatus('error');
      setError(requestError.message);
      setFailedPayload(payload);
      if (payload.text) setDraft(payload.text);
    }
  };

  const submitText = event => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || status === 'thinking') return;
    setDraft('');
    submitPayload({ text });
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      discardRecordingRef.current = false;
      recorder.ondataavailable = event => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        setRecording(false);
        if (discardRecordingRef.current || disposedRef.current) return;
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        submitPayload({ audio });
      };
      recorder.start();
      setRecording(true);
      setStatus('listening');
    } catch {
      setStatus('error');
      setError('Microphone is unavailable. Type a message instead.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const stopReply = () => {
    stopSpeaking();
    speechEventsRef.current?.dispose();
    setStatus('ready');
  };

  const returnHome = () => {
    abortRef.current?.abort();
    discardRecordingRef.current = true;
    stopRecording();
    stopReply();
    onReturnHome?.();
  };

  return (
    <main className="avatar-companion-view">
      <header className="avatar-companion-header">
        <button type="button" className="avatar-secondary-btn" onClick={returnHome}>
          <ArrowLeft size={20} /> {copy('returnHome')}
        </button>
        <div className={`avatar-status avatar-status-${status}`} role="status" aria-live="polite">
          <span aria-hidden="true" /> {copy(status)}
        </div>
      </header>

      <div className="avatar-companion-layout">
        <section className="avatar-visual-panel" aria-label="3D companion">
          {webglAvailable ? (
            <AvatarCanvas
              targetWeightsRef={targetWeightsRef}
              textureUrl={textureUrl}
              reducedMotion={reducedMotion}
              onUnavailable={() => setWebglAvailable(false)}
            />
          ) : (
            <div className="avatar-static-fallback">
              <img src={staticAvatar} alt="Companion" />
              <p>3D view is unavailable. Conversation still works.</p>
            </div>
          )}
          <p className="avatar-lipsync-note">Mouth movement follows browser speech timing and is approximate.</p>
        </section>

        <section className="avatar-conversation-panel" aria-labelledby="avatar-conversation-title">
          <div className="avatar-conversation-heading">
            <div>
              <h2 id="avatar-conversation-title">{copy('title')}</h2>
              <p>{copy('medical')}</p>
            </div>
            {status === 'speaking' && (
              <button type="button" className="avatar-stop-btn" onClick={stopReply}>
                <VolumeX size={20} /> {copy('stopSpeaking')}
              </button>
            )}
          </div>

          <div className="avatar-transcript" aria-live="polite" aria-label="Conversation transcript">
            {messages.length ? messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={`avatar-message avatar-message-${message.role}`}>
                <strong>{message.role === 'user' ? 'You' : 'Companion'}</strong>
                <p>{message.text}</p>
              </article>
            )) : (
              <div className="avatar-empty-transcript">
                <p>{copy('intro')}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="avatar-chat-error" role="alert">
              <AlertCircle size={20} />
              <span>{error}</span>
              {failedPayload && <button type="button" onClick={() => submitPayload(failedPayload)}><RotateCcw size={18} /> {copy('retry')}</button>}
            </div>
          )}

          <form className="avatar-chat-form" onSubmit={submitText}>
            <label htmlFor="avatar-chat-input">{copy('typeLabel')}</label>
            <div className="avatar-chat-input-row">
              <input
                id="avatar-chat-input"
                value={draft}
                onChange={event => setDraft(event.target.value)}
                maxLength={2000}
                disabled={status === 'thinking'}
                placeholder={copy('placeholder')}
              />
              <button type="submit" className="avatar-primary-btn" disabled={!draft.trim() || status === 'thinking'}>
                <Send size={20} /> {copy('send')}
              </button>
            </div>
          </form>

          <button
            type="button"
            className={recording ? 'avatar-stop-btn avatar-mic-btn' : 'avatar-secondary-btn avatar-mic-btn'}
            disabled={status === 'thinking' || status === 'speaking'}
            onClick={recording ? stopRecording : startRecording}
          >
            {recording ? <Square size={22} /> : <Mic size={22} />}
            {recording ? copy('stopRecording') : copy('speak')}
          </button>
        </section>
      </div>
    </main>
  );
}
