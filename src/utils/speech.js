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

const LANG_CODE_MAP = {
  en: 'en-IN',
  as: 'as-IN',
  hi: 'hi-IN',
  mni: 'mni-IN',
  trp: 'bn-IN'
};

const LANG_FALLBACK_CODES = {
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
  as: ['as-IN', 'as', 'bn-IN', 'bn', 'hi-IN', 'en-IN'],
  hi: ['hi-IN', 'hi', 'en-IN'],
  mni: ['mni-IN', 'mni', 'bn-IN', 'bn', 'hi-IN', 'en-IN'],
  trp: ['trp-IN', 'trp', 'bn-IN', 'bn', 'hi-IN', 'en-IN']
};

export function speakText(text, onEnd = null, language = 'en', events = {}) {
  try {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) {
      events.onError?.();
      if (onEnd) onEnd();
      return null;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Gentle, unhurried, warm and comforting delivery
    utterance.rate = 0.84;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = LANG_CODE_MAP[language] || 'en-IN';

    const voices = window.speechSynthesis.getVoices() || [];
    const searchCodes = LANG_FALLBACK_CODES[language] || ['en-IN', 'en'];

    let matchedVoice = null;

    // 1. First search for warm neural/natural regional voices for this language
    for (const code of searchCodes) {
      const codePrefix = code.toLowerCase();
      const candidate = voices.find(v => {
        const vLang = (v.lang || '').toLowerCase();
        const vName = (v.name || '').toLowerCase();
        const isLangMatch = vLang.startsWith(codePrefix) || vLang.replace('_', '-').startsWith(codePrefix);
        const isNatural = vName.includes('natural') || vName.includes('neural') || vName.includes('google') || 
                          vName.includes('swara') || vName.includes('madhur') || vName.includes('tanishaa') || 
                          vName.includes('heera') || vName.includes('kalpana') || vName.includes('veena') ||
                          vName.includes('samantha') || vName.includes('aria') || vName.includes('jenny');
        return isLangMatch && isNatural;
      });

      if (candidate) {
        matchedVoice = candidate;
        break;
      }
    }

    // 2. Search any voice matching language code
    if (!matchedVoice) {
      for (const code of searchCodes) {
        const codePrefix = code.toLowerCase();
        const candidate = voices.find(v => {
          const vLang = (v.lang || '').toLowerCase();
          return vLang.startsWith(codePrefix) || vLang.replace('_', '-').startsWith(codePrefix);
        });
        if (candidate) {
          matchedVoice = candidate;
          break;
        }
      }
    }

    // 3. Fallback to any natural soothing English/Indian voice
    if (!matchedVoice && voices.length > 0) {
      matchedVoice = voices.find(v => 
        ((v.name || '').includes('Natural') || (v.name || '').includes('Google') || (v.name || '').includes('Samantha') || (v.name || '').includes('Veena')) && 
        (v.lang || '').startsWith('en')
      ) || voices.find(v => (v.lang || '').startsWith('en')) || voices[0];
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    let finished = false;
    const finish = callback => event => {
      callback?.(event);
      if (!finished) {
        finished = true;
        onEnd?.();
      }
    };

    utterance.onstart = event => events.onStart?.(event);
    utterance.onboundary = event => events.onBoundary?.(event, text);
    utterance.onend = finish(events.onEnd);
    utterance.onerror = finish(events.onError);

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch {
    events.onError?.();
    if (onEnd) onEnd();
    return null;
  }
}

export function stopSpeaking() {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {}
}
