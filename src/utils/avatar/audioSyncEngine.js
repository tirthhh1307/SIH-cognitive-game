import { getBlendshapeWeights } from './visemeMapper.js';

export function parseRhubarbOutput(rawOutput) {
  if (!rawOutput) return [];
  if (Array.isArray(rawOutput)) return rawOutput;
  if (rawOutput.mouthCues && Array.isArray(rawOutput.mouthCues)) {
    return rawOutput.mouthCues.map(c => ({
      start: Number(c.start),
      end: Number(c.end),
      value: String(c.value).toUpperCase()
    }));
  }
  return [];
}

export class AudioSyncPlayer {
  constructor() {
    this.audio = null;
    this.visemes = [];
    this.animFrameId = null;
    this.onFrameCallback = null;
    this.onEndedCallback = null;
    this.isPlaying = false;
  }

  load(audioUrl, visemeData) {
    this.stop();
    this.visemes = parseRhubarbOutput(visemeData);
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      this.audio = new Audio(audioUrl);
      this.audio.preload = 'auto';

      this.audio.onended = () => {
        this.isPlaying = false;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        if (this.onEndedCallback) this.onEndedCallback();
      };
    }
  }

  play(onFrame, onEnded) {
    if (!this.audio) return;
    this.onFrameCallback = onFrame;
    this.onEndedCallback = onEnded;
    this.isPlaying = true;

    this.audio.play().then(() => {
      this._tick();
    }).catch(err => {
      console.error('Audio playback failed:', err);
      this.isPlaying = false;
    });
  }

  _tick() {
    if (!this.isPlaying || !this.audio) return;

    const currentTime = this.audio.currentTime;
    const weights = getBlendshapeWeights(this.visemes, currentTime);

    if (this.onFrameCallback) {
      this.onFrameCallback(weights, currentTime);
    }

    if (typeof requestAnimationFrame !== 'undefined') {
      this.animFrameId = requestAnimationFrame(() => this._tick());
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.animFrameId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }
}
