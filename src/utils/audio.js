// Web Audio API Sound Synthesizer for SIH Cognitive Game
// AudioContext deferred until first user gesture to avoid browser autoplay warnings
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

let soundVolume = 0.8;
let natureVolume = 0.5;
let isMuted = false;
let ambientGain = null;
let streamSource = null;
let isNaturePlaying = false;

export function setSoundVolume(vol) {
  soundVolume = Math.max(0, Math.min(1, vol));
}

export function setNatureVolume(vol) {
  natureVolume = Math.max(0, Math.min(1, vol));
  if (ambientGain && audioCtx) {
    ambientGain.gain.setValueAtTime(isMuted ? 0 : natureVolume * 0.3, audioCtx.currentTime);
  }
}

export function toggleMute(muted) {
  isMuted = muted;
  if (ambientGain && audioCtx) {
    ambientGain.gain.setValueAtTime(isMuted ? 0 : natureVolume * 0.3, audioCtx.currentTime);
  }
}

export function playClickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(soundVolume * 0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.09);
}

export function playHoverSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(soundVolume * 0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.13);
}

export function playSuccessSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

    gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
    gain.gain.linearRampToValueAtTime(soundVolume * 0.25, ctx.currentTime + index * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + index * 0.08);
    osc.stop(ctx.currentTime + index * 0.08 + 0.65);
  });
}

export function playStarSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [784, 988, 1175, 1568];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

    gain.gain.setValueAtTime(soundVolume * 0.3, ctx.currentTime + idx * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.05);
    osc.stop(ctx.currentTime + idx * 0.05 + 0.45);
  });
}

export function playXylophoneNote(frequency = 440) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(frequency, ctx.currentTime);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(frequency * 3.01, ctx.currentTime);

  gain.gain.setValueAtTime(soundVolume * 0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(soundVolume * 0.15, ctx.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(soundVolume * 0.15, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

  osc1.connect(gain);
  osc2.connect(gain2);
  gain.connect(ctx.destination);
  gain2.connect(ctx.destination);

  osc1.start();
  osc2.start();
  osc1.stop(ctx.currentTime + 0.85);
  osc2.stop(ctx.currentTime + 0.25);
}

export function playDrumBeat(type = 'dhol') {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const freq = type === 'high' ? 240 : 120;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(soundVolume * 0.6, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.28);
}

export function playHornbillCall() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 0.15);
  osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.35);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(soundVolume * 0.35, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.45);
}

export function startNatureAmbience() {
  if (isNaturePlaying) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
    }

    streamSource = ctx.createBufferSource();
    streamSource.buffer = buffer;
    streamSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 650;
    filter.Q.value = 0.8;

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(isMuted ? 0 : natureVolume * 0.25, ctx.currentTime);

    streamSource.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    streamSource.start();
    isNaturePlaying = true;
  } catch (e) {
    console.warn("Nature audio could not start automatically:", e);
  }
}

export function stopNatureAmbience() {
  if (streamSource) {
    try {
      streamSource.stop();
      streamSource.disconnect();
    } catch (e) {}
    streamSource = null;
  }
  isNaturePlaying = false;
}
