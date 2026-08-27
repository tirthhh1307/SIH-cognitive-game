const DB_NAME = 'cognitive-platform-media';
const STORE_NAME = 'anchors';
let databasePromise;

export function validateAnchorInput(anchor) {
  if (!anchor.name?.trim()) return 'Name is required.';
  if (!anchor.relationship?.trim()) return 'Relationship is required.';
  if (anchor.name.trim().length > 60 || anchor.relationship.trim().length > 60) return 'Name and relationship must be 60 characters or fewer.';
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
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return databasePromise;
}

async function requestFromStore(mode, run) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = run(transaction.objectStore(STORE_NAME));
    transaction.oncomplete = () => resolve(request?.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error('Media transaction aborted'));
  });
}

export async function listAnchors() {
  return (await requestFromStore('readonly', store => store.getAll())) ?? [];
}

export async function putAnchor(anchor) {
  const error = validateAnchorInput(anchor);
  if (error) throw new Error(error);
  const normalized = { ...anchor, name: anchor.name.trim(), relationship: anchor.relationship.trim() };
  await requestFromStore('readwrite', store => store.put(normalized));
  return normalized;
}

export async function deleteAnchor(id) {
  await requestFromStore('readwrite', store => store.delete(id));
}

export async function clearAnchors() {
  await requestFromStore('readwrite', store => store.clear());
}
