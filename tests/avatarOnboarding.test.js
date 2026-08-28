import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePhotoSet, validateVoiceSample } from '../src/utils/avatar/cameraHelper.js';

test('validatePhotoSet requires front, left, and right photos', () => {
  const validSet = {
    front: 'data:image/jpeg;base64,123',
    left: 'data:image/jpeg;base64,456',
    right: 'data:image/jpeg;base64,789'
  };
  assert.equal(validatePhotoSet(validSet), true);

  const invalidSet = { front: 'data:image/jpeg;base64,123' };
  assert.equal(validatePhotoSet(invalidSet), false);
});

test('validateVoiceSample checks minimum audio duration', () => {
  assert.equal(validateVoiceSample(4.5), false);
  assert.equal(validateVoiceSample(5.2), true);
});
