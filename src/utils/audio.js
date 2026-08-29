// Web Audio API Sound Synthesizer for SIH Cognitive Game
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
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

export function playPepaHorn(frequency = 587.33) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  // Gentle pitch bend typical of hornpipe
  osc.frequency.linearRampToValueAtTime(frequency * 1.03, ctx.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(frequency, ctx.currentTime + 0.35);

  osc2.type = 'square';
  osc2.frequency.setValueAtTime(frequency * 2, ctx.currentTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, ctx.currentTime);
  filter.Q.value = 3;

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(soundVolume * 0.45, ctx.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(soundVolume * 0.25, ctx.currentTime + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc2.start();
  osc.stop(ctx.currentTime + 0.65);
  osc2.stop(ctx.currentTime + 0.65);
}

export function playTokariPluck(frequency = 392) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const oscHarmonic = ctx.createOscillator();
  const gain = ctx.createGain();
  const gainHarmonic = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  oscHarmonic.type = 'sine';
  oscHarmonic.frequency.setValueAtTime(frequency * 2.01, ctx.currentTime);

  gain.gain.setValueAtTime(soundVolume * 0.6, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(soundVolume * 0.1, ctx.currentTime + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.75);

  gainHarmonic.gain.setValueAtTime(soundVolume * 0.3, ctx.currentTime);
  gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

  osc.connect(gain);
  oscHarmonic.connect(gainHarmonic);
  gain.connect(ctx.destination);
  gainHarmonic.connect(ctx.destination);

  osc.start();
  oscHarmonic.start();
  osc.stop(ctx.currentTime + 0.8);
  oscHarmonic.stop(ctx.currentTime + 0.35);
}

export function playGaganaReed(frequency = 440) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  // Twang pitch glide
  osc.frequency.exponentialRampToValueAtTime(frequency * 1.15, ctx.currentTime + 0.08);
  osc.frequency.exponentialRampToValueAtTime(frequency, ctx.currentTime + 0.25);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(850, ctx.currentTime);
  filter.frequency.linearRampToValueAtTime(1600, ctx.currentTime + 0.1);
  filter.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.35);
  filter.Q.value = 5;

  gain.gain.setValueAtTime(soundVolume * 0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

export function playTaalCymbal() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const frequencies = [840, 1120, 1680, 2240, 3150];
  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq + (Math.random() * 20 - 10), ctx.currentTime);

    const initialGain = soundVolume * (0.2 / (idx + 1));
    gain.gain.setValueAtTime(initialGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.25);
  });
}

export function playFluteTone(frequency = 659.25) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  // Slight warm vibrato
  osc.frequency.linearRampToValueAtTime(frequency * 1.008, ctx.currentTime + 0.2);
  osc.frequency.linearRampToValueAtTime(frequency * 0.995, ctx.currentTime + 0.4);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(soundVolume * 0.4, ctx.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(soundVolume * 0.25, ctx.currentTime + 0.45);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.9);
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

