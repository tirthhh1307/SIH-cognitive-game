import test from 'node:test';
import assert from 'node:assert/strict';
import { NAV_ITEMS, CONSENT_COPY } from '../src/data/shell.js';

test('navigation exposes five labelled destinations', () => {
  assert.deepEqual(NAV_ITEMS.map(({ id, label }) => [id, label]), [
    ['home', 'Home'],
    ['play', 'Play'],
    ['check-in', 'Check-in'],
    ['anchors', 'Memory'],
    ['caregiver', 'Caregiver']
  ]);
});

test('consent explains local storage and medical boundary', () => {
  assert.match(CONSENT_COPY.local, /stays on this device/i);
  assert.match(CONSENT_COPY.medical, /does not diagnose dementia/i);
});
