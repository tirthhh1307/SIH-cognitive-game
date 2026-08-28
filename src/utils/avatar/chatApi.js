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

export async function sendChat(payload, { signal, fetchImpl = fetch } = {}) {
  const response = await fetchImpl('/api/chat/interact', {
    method: 'POST',
    body: buildChatForm(payload),
    signal
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || 'Unable to reach the companion.');
  return data;
}
