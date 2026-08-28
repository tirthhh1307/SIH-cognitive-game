import { RHUBARB_MORPH_MAP } from './visemeMapper.js';


export function getBoundaryViseme(text, charIndex = 0) {
  const token = text.slice(Math.max(0, charIndex)).match(/[a-z]+/i)?.[0]?.toLowerCase() || '';
  if (token.includes('a')) return 'D';
  if (/[eiy]/.test(token)) return 'B';
  if (/[ou]/.test(token)) return 'E';
  return token ? 'C' : 'X';
}


export function createSpeechVisemeEvents(setWeights, timers = globalThis) {
  let neutralTimer;
  const neutral = () => setWeights({ ...RHUBARB_MORPH_MAP.X });

  return {
    onStart: () => setWeights({ ...RHUBARB_MORPH_MAP.C }),
    onBoundary: (event, text) => {
      timers.clearTimeout(neutralTimer);
      setWeights({ ...RHUBARB_MORPH_MAP[getBoundaryViseme(text, event.charIndex)] });
      neutralTimer = timers.setTimeout(neutral, 180);
    },
    onEnd: neutral,
    onError: neutral,
    dispose: () => {
      timers.clearTimeout(neutralTimer);
      neutral();
    }
  };
}
