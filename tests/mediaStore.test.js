import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAnchorInput } from '../src/utils/mediaStore.js';

const file = (type, size) => ({ type, size });

test('anchor requires a name and relationship', () => {
  assert.equal(validateAnchorInput({ name: '', relationship: 'Daughter' }), 'Name is required.');
  assert.equal(validateAnchorInput({ name: 'Mina', relationship: '' }), 'Relationship is required.');
});

test('anchor rejects unsupported or oversized media before storage', () => {
  assert.equal(validateAnchorInput({ name: 'Mina', relationship: 'Daughter', photoBlob: file('image/gif', 10) }), 'Photo must be JPG, PNG, or WebP.');
  assert.equal(validateAnchorInput({ name: 'Mina', relationship: 'Daughter', photoBlob: file('image/jpeg', 5 * 1024 * 1024 + 1) }), 'Photo must be 5 MB or smaller.');
  assert.equal(validateAnchorInput({ name: 'Mina', relationship: 'Daughter', audioBlob: file('audio/webm', 8 * 1024 * 1024 + 1) }), 'Audio must be 8 MB or smaller.');
});

test('valid anchor input returns no error', () => {
  assert.equal(validateAnchorInput({ name: ' Mina ', relationship: ' Daughter ', photoBlob: file('image/png', 100), audioBlob: file('audio/webm', 100) }), '');
});
