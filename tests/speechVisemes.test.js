import test from 'node:test';
import assert from 'node:assert/strict';
import { getBoundaryViseme, createSpeechVisemeEvents } from '../src/utils/avatar/speechVisemes.js';

test('boundary vowels map to bounded mouth shapes', () => {
  assert.equal(getBoundaryViseme('A calm hello', 0), 'D');
  assert.equal(getBoundaryViseme('A calm hello', 7), 'B');
});

test('speech lifecycle opens then returns the face to neutral', () => {
  const updates = [];
  const events = createSpeechVisemeEvents(weights => updates.push(weights), {
    setTimeout: () => 1,
    clearTimeout: () => {}
  });
  events.onStart();
  events.onBoundary({ charIndex: 0 }, 'A hello');
  assert.ok(updates.at(-1).jawOpen > 0);
  events.onEnd();
  assert.equal(updates.at(-1).jawOpen, 0);
});
