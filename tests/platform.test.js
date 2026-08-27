import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  loadPlatformState,
  recordAttempt,
  getAdaptiveDifficulty,
  getCategorySummaries,
  getReviewFlags,
  addCheckIn,
  upsertReminder,
  removeReminder,
  getDueReminders
} from '../src/utils/platform.js';

const game = {
  id: 'card-match',
  category: 'working-memory',
  stages: ['mild'],
  difficulty: { mild: { min: 1, max: 3, initial: 2 } }
};
let nextId = 0;
const attempt = (accuracy, hints = 0, score = accuracy) => ({
  id: `attempt-${++nextId}`,
  gameId: game.id,
  category: game.category,
  stage: 'mild',
  difficulty: 2,
  accuracy,
  score,
  hints,
  durationMs: 12000,
  completedAt: '2026-08-27T10:00:00.000Z'
});

test('initial state uses schema 1 and local consent is false', () => {
  const state = createInitialState();
  assert.equal(state.schemaVersion, 1);
  assert.equal(state.consent.accepted, false);
  assert.deepEqual(state.attempts, []);
});

test('invalid stored JSON safely returns initial state', () => {
  const storage = { getItem: () => '{broken' };
  assert.deepEqual(loadPlatformState(storage), createInitialState());
});

test('two strong attempts raise one step', () => {
  let state = createInitialState();
  state = recordAttempt(state, attempt(90));
  state = recordAttempt(state, attempt(85, 1));
  assert.equal(getAdaptiveDifficulty(state, game), 3);
});

test('two struggling attempts lower one step', () => {
  let state = createInitialState();
  state = recordAttempt(state, attempt(45, 2));
  state = recordAttempt(state, attempt(40, 3));
  assert.equal(getAdaptiveDifficulty(state, game), 1);
});

test('20-point decline after three attempts creates review flag', () => {
  let state = { ...createInitialState(), baseline: { 'working-memory': 80 } };
  state = [50, 55, 45].reduce((next, score) => recordAttempt(next, attempt(score, 0, score)), state);
  assert.equal(getCategorySummaries(state)[0].recentScore, 50);
  assert.equal(getReviewFlags(state)[0].category, 'working-memory');
});

test('saved schema-1 profile merges with defaults', () => {
  const storage = {
    getItem: () => JSON.stringify({ schemaVersion: 1, profile: { name: 'Mina' } })
  };
  const state = loadPlatformState(storage);
  assert.equal(state.profile.name, 'Mina');
  assert.equal(state.profile.stage, 'mild');
  assert.equal(state.settings.voice, true);
});

test('daily check-in replaces same-day record without duplicating it', () => {
  let state = createInitialState();
  const first = { id: 'one', date: '2026-08-27', medicine: true, meals: false, walk: false, mood: 'calm', recentEvent: '' };
  const updated = { ...first, id: 'two', meals: true };
  state = addCheckIn(state, first);
  state = addCheckIn(state, updated);
  assert.equal(state.checkIns.length, 1);
  assert.equal(state.checkIns[0].id, 'two');
});

test('due reminders match local HH:MM and enabled status', () => {
  let state = createInitialState();
  state = upsertReminder(state, { id: 'meds', label: 'Medicine', time: '09:30', enabled: true });
  state = upsertReminder(state, { id: 'walk', label: 'Walk', time: '10:00', enabled: false });
  const due = getDueReminders(state, new Date(2026, 7, 27, 9, 30));
  assert.deepEqual(due.map(({ id }) => id), ['meds']);
  assert.equal(removeReminder(state, 'meds').reminders.length, 1);
});
