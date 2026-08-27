import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES, validateGameCatalog } from '../src/data/games.js';

const expectedIds = [
  'card-match', 'sequence-repeat', 'item-recall', 'route-puzzle',
  'childhood-trivia', 'family-tree', 'today-recall', 'photo-diary',
  'odd-one-out', 'naming-game', 'category-sorting', 'routine-sequence',
  'task-simulation', 'family-face-match', 'voice-recognition',
  'emotion-recognition', 'festival-match', 'folk-story-sequence',
  'local-music-recall', 'spot-difference', 'tap-target',
  'word-association', 'proverb-completion', 'color-tap',
  'sound-match', 'yes-no-recognition'
];

test('catalog contains all 26 unique documented games', () => {
  assert.deepEqual(GAMES.map(({ id }) => id).sort(), expectedIds.sort());
  assert.equal(new Set(GAMES.map(({ id }) => id)).size, 26);
});

test('every game config is runnable', () => {
  assert.deepEqual(validateGameCatalog(GAMES), []);
});
