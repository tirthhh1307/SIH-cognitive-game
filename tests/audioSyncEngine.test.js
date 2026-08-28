import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRhubarbOutput } from '../src/utils/avatar/audioSyncEngine.js';

test('parseRhubarbOutput correctly converts raw TSV/JSON cues to structured intervals', () => {
  const rawRhubarbJson = {
    mouthCues: [
      { start: 0.0, end: 0.25, value: 'X' },
      { start: 0.25, end: 0.65, value: 'B' },
      { start: 0.65, end: 1.10, value: 'D' },
      { start: 1.10, end: 1.30, value: 'X' }
    ]
  };

  const parsed = parseRhubarbOutput(rawRhubarbJson);
  assert.equal(parsed.length, 4);
  assert.equal(parsed[1].value, 'B');
  assert.equal(parsed[2].start, 0.65);
});
