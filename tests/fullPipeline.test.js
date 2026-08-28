import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRhubarbOutput } from '../src/utils/avatar/audioSyncEngine.js';
import { getBlendshapeWeights } from '../src/utils/avatar/visemeMapper.js';

test('end-to-end payload transforms to active blendshapes', () => {
  const backendResponse = {
    audioUrl: 'http://localhost:8000/static/audio/test.wav',
    visemes: [
      { start: 0.0, end: 0.5, value: 'X' },
      { start: 0.5, end: 1.2, value: 'D' }
    ]
  };

  const parsed = parseRhubarbOutput(backendResponse.visemes);
  const weights = getBlendshapeWeights(parsed, 0.8);
  assert.ok(weights.jawOpen > 0.5);
});
