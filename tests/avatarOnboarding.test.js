import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAvatarMedia, validatePhotoSet, validateVoiceSample } from '../src/utils/avatar/cameraHelper.js';

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

test('avatar media requires three supported images but not voice', () => {
  const image = { type: 'image/jpeg', size: 1024 };
  assert.equal(validateAvatarMedia({ photos: { front: image, left: image, right: image } }), '');
  assert.match(validateAvatarMedia({ photos: { front: image } }), /three photos/i);
});

test('avatar media rejects oversized voice references', () => {
  const image = { type: 'image/jpeg', size: 1024 };
  const error = validateAvatarMedia({
    photos: { front: image, left: image, right: image },
    voiceBlob: { type: 'audio/webm', size: 9 * 1024 * 1024 }
  });
  assert.match(error, /8 MB/i);
});
