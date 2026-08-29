import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) ||
  '';
const MODEL = 'gemini-2.5-flash-lite';

const SYSTEM_INSTRUCTION =
  'You are Apon Mon, a calm companion for an older adult. Reply in short, ' +
  'clear sentences. Never diagnose dementia or replace medical care. ' +
  'For medical decisions, ask the person to involve a caregiver or qualified clinician.';

export function trimHistory(history) {
  return (Array.isArray(history) ? history : [])
    .filter(item =>
      item &&
      (item.role === 'user' || item.role === 'model') &&
      typeof item.text === 'string' &&
      item.text.trim()
    )
    .map(item => ({ role: item.role, text: item.text.trim().slice(0, 2000) }))
    .slice(-8);
}

export function buildChatForm({ text, audio, history, profileId = 'local' }) {
  const form = new FormData();
  if (audio) form.append('audio', audio, `voice.${audio.type?.includes('ogg') ? 'ogg' : 'webm'}`);
  else form.append('text', String(text || '').trim());
  form.append('history', JSON.stringify(trimHistory(history)));
  form.append('profile_id', profileId);
  return form;
}

export async function sendChat(payload, { signal, fetchImpl } = {}) {
  const { text, history = [] } = payload;
  const inputText = (text || '').trim();
  if (!inputText && !payload.audio) throw new Error('Please type a message.');

  // If fetchImpl is provided (e.g. In tests or custom proxy), use standard API endpoint
  if (fetchImpl) {
    const response = await fetchImpl('/api/chat/interact', {
      method: 'POST',
      body: buildChatForm(payload),
      signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || 'Unable to reach the companion.');
    return data;
  }

  // Fallback to fetch backend if API key is not configured
  if (!API_KEY) {
    try {
      const response = await fetch('/api/chat/interact', {
        method: 'POST',
        body: buildChatForm(payload),
        signal
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.text) return data;
    } catch {
      // Backend not running, fall through
    }
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 180,
    },
  });

  const contents = trimHistory(history).map(item => ({
    role: item.role,
    parts: [{ text: item.text }],
  }));

  const chat = model.startChat({ history: contents });

  const resultPromise = chat.sendMessage(inputText);
  if (signal) {
    const abortPromise = new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
    const result = await Promise.race([resultPromise, abortPromise]);
    const reply = (result.response.text() || '').trim();
    if (!reply) throw new Error('Companion returned an empty response.');
    return { inputText, text: reply };
  }

  const result = await resultPromise;
  const reply = (result.response.text() || '').trim();
  if (!reply) throw new Error('Companion returned an empty response.');
  return { inputText, text: reply };
}
