export function validatePhotoSet(photos) {
  if (!photos || typeof photos !== 'object') return false;
  return Boolean(photos.front && photos.left && photos.right);
}

export function validateVoiceSample(durationSeconds, minDuration = 5.0) {
  return typeof durationSeconds === 'number' && durationSeconds >= minDuration;
}
