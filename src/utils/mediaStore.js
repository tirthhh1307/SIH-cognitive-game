const DB_NAME = 'cognitive-platform-media';
const ANCHOR_STORE = 'anchors';
const AVATAR_STORE = 'avatar';
let databasePromise;

export function validateAnchorInput(anchor) {
  if (!anchor.name?.trim()) return 'Name is required.';
  if (!anchor.relationship?.trim()) return 'Relationship is required.';
  if (anchor.name.trim().length > 60 || anchor.relationship.trim().length > 60) return 'Name and relationship must be 60 characters or fewer.';
  if (anchor.phone && anchor.phone.trim().length > 30) return 'Phone number must be 30 characters or fewer.';
  if (anchor.photoBlob) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(anchor.photoBlob.type)) return 'Photo must be JPG, PNG, or WebP.';
    if (anchor.photoBlob.size > 5 * 1024 * 1024) return 'Photo must be 5 MB or smaller.';
  }
  if (anchor.audioBlob) {
    if (!anchor.audioBlob.type?.startsWith('audio/')) return 'Audio must be a supported audio file.';
    if (anchor.audioBlob.size > 8 * 1024 * 1024) return 'Audio must be 8 MB or smaller.';
  }
  return '';
}

function openDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(ANCHOR_STORE)) {
        request.result.createObjectStore(ANCHOR_STORE, { keyPath: 'id' });
      }
      if (!request.result.objectStoreNames.contains(AVATAR_STORE)) {
        request.result.createObjectStore(AVATAR_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return databasePromise;
}

async function requestFromStore(storeName, mode, run) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = run(transaction.objectStore(storeName));
    transaction.oncomplete = () => resolve(request?.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error('Media transaction aborted'));
  });
}

export async function listAnchors() {
  return (await requestFromStore(ANCHOR_STORE, 'readonly', store => store.getAll())) ?? [];
}

export async function putAnchor(anchor) {
  const error = validateAnchorInput(anchor);
  if (error) throw new Error(error);
  const normalized = {
    ...anchor,
    name: anchor.name.trim(),
    relationship: anchor.relationship.trim(),
    phone: anchor.phone?.trim() || ''
  };
  await requestFromStore(ANCHOR_STORE, 'readwrite', store => store.put(normalized));
  return normalized;
}

export async function deleteAnchor(id) {
  await requestFromStore(ANCHOR_STORE, 'readwrite', store => store.delete(id));
}

export async function clearAnchors() {
  await requestFromStore(ANCHOR_STORE, 'readwrite', store => store.clear());
}

export async function getAvatarMedia() {
  return (await requestFromStore(AVATAR_STORE, 'readonly', store => store.get('current'))) ?? null;
}

export async function putAvatarMedia(profile) {
  const record = { ...profile, id: 'current', updatedAt: new Date().toISOString() };
  await requestFromStore(AVATAR_STORE, 'readwrite', store => store.put(record));
  return record;
}

export async function clearAvatarMedia() {
  await requestFromStore(AVATAR_STORE, 'readwrite', store => store.clear());
}
