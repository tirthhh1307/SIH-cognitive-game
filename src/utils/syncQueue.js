const SYNC_QUEUE_KEY = 'cognitive-platform-sync-queue-v1';
const SYNC_META_KEY = 'cognitive-platform-sync-meta-v1';

export const SYNC_ACTION_TYPES = {
  ASSESSMENT_COMPLETED: 'ASSESSMENT_COMPLETED',
  CHECK_IN_LOGGED: 'CHECK_IN_LOGGED',
  ALERT_FLAGGED: 'ALERT_FLAGGED',
  PATIENT_CREATED: 'PATIENT_CREATED',
  PATIENT_UPDATED: 'PATIENT_UPDATED',
  GARDEN_HARVEST: 'GARDEN_HARVEST',
  NOTE_ADDED: 'NOTE_ADDED'
};

export function getSyncQueue(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSyncQueue(queue, storage = globalThis.localStorage) {
  try {
    storage?.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to persist sync queue', err);
  }
}

export function getSyncMeta(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(SYNC_META_KEY);
    if (!raw) return { lastSyncedAt: null, totalSynced: 0 };
    return JSON.parse(raw) || { lastSyncedAt: null, totalSynced: 0 };
  } catch {
    return { lastSyncedAt: null, totalSynced: 0 };
  }
}

export function saveSyncMeta(meta, storage = globalThis.localStorage) {
  try {
    storage?.setItem(SYNC_META_KEY, JSON.stringify(meta));
  } catch (err) {
    console.error('Failed to persist sync meta', err);
  }
}

export function enqueueSyncAction(type, payload, patientId = 'default', storage = globalThis.localStorage) {
  const item = {
    id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    patientId,
    payload,
    timestamp: Date.now(),
    attempts: 0
  };

  const queue = getSyncQueue(storage);
  queue.push(item);
  saveSyncQueue(queue, storage);
  return { item, queueLength: queue.length };
}

export function clearSyncQueue(storage = globalThis.localStorage) {
  saveSyncQueue([], storage);
}

export async function flushSyncQueue(options = {}, storage = globalThis.localStorage) {
  const queue = getSyncQueue(storage);
  if (!queue.length) {
    return { success: true, count: 0, message: 'Queue is empty' };
  }

  const isOnline = typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true;
  if (!isOnline && !options.forceMock) {
    return { success: false, count: 0, message: 'Device is offline. Saved in local queue.' };
  }

  try {
    // In production, posts to PHC/CHC tele-health API or Firebase / Supabase.
    // In prototype/offline mode, simulate atomic batch sync with 300ms network latency.
    if (options.endpoint) {
      const res = await fetch(options.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: queue, syncedAt: Date.now() })
      });
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
    } else {
      // Local sync simulation
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const count = queue.length;
    clearSyncQueue(storage);
    const meta = getSyncMeta(storage);
    const updatedMeta = {
      lastSyncedAt: Date.now(),
      totalSynced: (meta.totalSynced || 0) + count
    };
    saveSyncMeta(updatedMeta, storage);

    return {
      success: true,
      count,
      lastSyncedAt: updatedMeta.lastSyncedAt,
      message: `Successfully synchronized ${count} records to regional health portal.`
    };
  } catch (err) {
    return {
      success: false,
      count: 0,
      error: err.message,
      message: 'Sync failed, items remain in local outbox queue.'
    };
  }
}

export function getSyncStatus(storage = globalThis.localStorage) {
  const queue = getSyncQueue(storage);
  const meta = getSyncMeta(storage);
  const isOnline = typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true;

  let status = 'synced'; // 'synced' | 'queued' | 'offline'
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
    status = 'queued';
  }

  return {
    isOnline,
    status,
    pendingCount: queue.length,
    lastSyncedAt: meta.lastSyncedAt,
    totalSynced: meta.totalSynced || 0
  };
}

export function registerAutoSync(onSyncCallback, storage = globalThis.localStorage) {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = async () => {
    const queue = getSyncQueue(storage);
    if (queue.length > 0) {
      const result = await flushSyncQueue({}, storage);
      if (onSyncCallback) onSyncCallback(result);
    } else if (onSyncCallback) {
      onSyncCallback({ success: true, count: 0 });
    }
  };

  const handleOffline = () => {
    if (onSyncCallback) onSyncCallback({ isOnline: false });
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
