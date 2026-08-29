import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyB6fgftlMeU2t7tAOtUqFViULA0Z0k6nLw';
const MODEL = 'gemini-3.5-flash-lite';

const SYSTEM_INSTRUCTION =
  'You are Apon Mon, a calm companion for an older adult. Reply in short, ' +
  'clear sentences. Never diagnose dementia or replace medical care. ' +
  'For medical decisions, ask the person to involve a caregiver or qualified clinician.';

const genAI = new GoogleGenerativeAI(API_KEY);

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

export async function sendChat(payload, { signal } = {}) {
  const { text, history = [] } = payload;
  const inputText = (text || '').trim();
  if (!inputText) throw new Error('Please type a message.');

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

  // Support AbortController
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
