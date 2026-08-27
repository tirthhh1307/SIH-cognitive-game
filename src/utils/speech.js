let isVoiceEnabled = true;

export function setVoiceEnabled(enabled) {
  isVoiceEnabled = enabled;
  if (!enabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function getVoiceEnabled() {
  return isVoiceEnabled;
}

export function speakText(text, onEnd = null, language = 'en') {
  if (!isVoiceEnabled || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.pitch = 1.05;
  utterance.lang = language === 'as' ? 'as-IN' : 'en-IN';

  const voices = window.speechSynthesis.getVoices();
  const languageVoice = voices.find(v => v.lang.toLowerCase().startsWith(language === 'as' ? 'as' : 'en'));
  const preferredVoice = languageVoice || voices.find(v =>
    (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Zira')) && v.lang.startsWith('en')
  ) || voices.find(v => v.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
