import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSyncQueue,
  enqueueSyncAction,
  clearSyncQueue,
  flushSyncQueue,
  getSyncStatus,
  SYNC_ACTION_TYPES
} from '../src/utils/syncQueue.js';

function createMockStorage() {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear()
  };
}

test('initial sync queue is empty', () => {
  const storage = createMockStorage();
  const queue = getSyncQueue(storage);
  assert.deepEqual(queue, []);
});

test('enqueueSyncAction appends items to queue and returns length', () => {
  const storage = createMockStorage();
  const { item, queueLength } = enqueueSyncAction(
    SYNC_ACTION_TYPES.ASSESSMENT_COMPLETED,
    { gameId: 'bihu-rhythm', score: 90 },
    'patient-1',
    storage
  );

  assert.equal(queueLength, 1);
  assert.equal(item.type, SYNC_ACTION_TYPES.ASSESSMENT_COMPLETED);
  assert.equal(item.patientId, 'patient-1');

  const queue = getSyncQueue(storage);
  assert.equal(queue.length, 1);
  assert.equal(queue[0].payload.score, 90);
});

test('flushSyncQueue empties the queue and records sync metadata', async () => {
  const storage = createMockStorage();
  enqueueSyncAction(SYNC_ACTION_TYPES.ASSESSMENT_COMPLETED, { score: 85 }, 'patient-1', storage);
  enqueueSyncAction(SYNC_ACTION_TYPES.CHECK_IN_LOGGED, { mood: 'peaceful' }, 'patient-1', storage);

  assert.equal(getSyncQueue(storage).length, 2);

  const result = await flushSyncQueue({ forceMock: true }, storage);
  assert.equal(result.success, true);
  assert.equal(result.count, 2);
  assert.equal(getSyncQueue(storage).length, 0);

  const status = getSyncStatus(storage);
  assert.equal(status.pendingCount, 0);
  assert.ok(status.lastSyncedAt > 0);
});

test('clearSyncQueue empties queue without flushing', () => {
  const storage = createMockStorage();
  enqueueSyncAction(SYNC_ACTION_TYPES.ALERT_FLAGGED, { level: 'amber' }, 'patient-1', storage);
  assert.equal(getSyncQueue(storage).length, 1);

  clearSyncQueue(storage);
  assert.equal(getSyncQueue(storage).length, 0);
});
