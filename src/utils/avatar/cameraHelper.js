export function validatePhotoSet(photos) {
  if (!photos || typeof photos !== 'object') return false;
  return Boolean(photos.front && photos.left && photos.right);
}

export function validateVoiceSample(durationSeconds, minDuration = 5.0) {
  return typeof durationSeconds === 'number' && durationSeconds >= minDuration;
}

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateAvatarMedia({ photos, voiceBlob } = {}) {
  if (!photos || !['front', 'left', 'right'].every(angle => photos[angle])) {
    return 'Please add all three photos.';
  }
  for (const photo of Object.values(photos)) {
    if (!PHOTO_TYPES.includes(photo.type)) return 'Photos must be JPG, PNG, or WebP.';
    if (photo.size > 5 * 1024 * 1024) return 'Each photo must be 5 MB or smaller.';
  }
  if (voiceBlob) {
    if (!voiceBlob.type?.startsWith('audio/')) return 'Voice sample must be an audio file.';
    if (voiceBlob.size > 8 * 1024 * 1024) return 'Voice sample must be 8 MB or smaller.';
  }
  return '';
}

export async function createFaceTexture(frontBlob) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(frontBlob);
    const size = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    context.filter = 'saturate(0.8) contrast(1.1)';
    context.drawImage(
      bitmap,
      (bitmap.width - size) / 2,
      (bitmap.height - size) / 2,
      size,
      size,
      0,
      0,
      512,
      512
    );
    const texture = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.82));
    if (!texture) throw new Error('Texture encoding failed');
    return texture;
  } catch {
    throw new Error('Unable to prepare avatar texture.');
  } finally {
    bitmap?.close();
  }
}
