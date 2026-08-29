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

const OFFLINE_COMPANION_RESPONSES = [
  { keywords: ['hello', 'hi', 'hey', 'namaste', 'nomoskar', 'morning', 'afternoon', 'evening'], response: 'Hello! It is wonderful to spend time with you today. I hope you are having a peaceful day.' },
  { keywords: ['song', 'sing', 'music', 'bihu', 'dhol', 'tune'], response: 'Music brings such joy to the mind and heart. Listening to familiar folk melodies always brings peace.' },
  { keywords: ['tea', 'drink', 'water', 'thirsty', 'eat', 'food'], response: 'A warm cup of Assam tea is always comforting. Please remember to take gentle sips of water and stay hydrated.' },
  { keywords: ['who are you', 'your name', 'what are you'], response: 'I am Sanjibani, your gentle companion here to keep you company, share stories, and bring you peace.' },
  { keywords: ['how are you', 'how do you do'], response: 'I am doing very well, thank you for asking! It warms my heart to be here with you.' },
  { keywords: ['worried', 'sad', 'scared', 'pain', 'lonely', 'anxious', 'tired'], response: 'Take a slow, gentle breath. You are safe, and everything is okay. Take all the time you need to rest.' },
  { keywords: ['game', 'play', 'memory', 'score'], response: 'Practicing games gently every day helps keep the mind active and bright. You are doing wonderfully.' }
];

export function getOfflineCompanionReply(text) {
  const lower = (text || '').toLowerCase();
  for (const entry of OFFLINE_COMPANION_RESPONSES) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return { inputText: text, text: entry.response };
    }
  }
  const defaultReplies = [
    'I am right here with you. Take your time, relax, and let us enjoy this peaceful moment together.',
    'That is wonderful to share. Every gentle thought brings sunshine to the day.',
    'I am listening. Take a calm breath and feel at ease.'
  ];
  const chosen = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
  return { inputText: text, text: chosen };
}

export async function sendChat(payload, { signal, fetchImpl } = {}) {
  const { text, history = [] } = payload;
  const inputText = (text || '').trim();
  if (!inputText && !payload.audio) throw new Error('Please type a message.');

  // 1. If fetchImpl is provided (e.g. in tests or custom proxy), use standard API endpoint
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

  // 2. Try local Python FastAPI backend if running
  try {
    const response = await fetch('/api/chat/interact', {
      method: 'POST',
      body: buildChatForm(payload),
      signal
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.text) return data;
  } catch (fetchErr) {
    if (fetchErr.name === 'AbortError') throw fetchErr;
  }

  // 3. If API Key is present, call Google Generative AI
  if (API_KEY && API_KEY !== 'replace-with-your-key') {
    try {
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
        if (reply) return { inputText, text: reply };
      } else {
        const result = await resultPromise;
        const reply = (result.response.text() || '').trim();
        if (reply) return { inputText, text: reply };
      }
    } catch (apiError) {
      if (apiError.name === 'AbortError') throw apiError;
      console.warn('Gemini API call failed, using offline companion fallback:', apiError);
    }
  }

  // 4. Offline companion fallback (works 100% without internet or API key)
  return getOfflineCompanionReply(inputText);
}
