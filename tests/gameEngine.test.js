import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatchDeck, createSequence, evaluateOrder, getStageLimit, scoreRound } from '../src/utils/gameEngine.js';

test('match deck creates two uniquely keyed cards per selected pair', () => {
  const deck = createMatchDeck([
    { id: 'tea', label: 'Tea', symbol: '🍵' },
    { id: 'dhol', label: 'Dhol', symbol: '🪘' },
    { id: 'lotus', label: 'Lotus', symbol: '🪷' }
  ], 2, () => 0.5);
  assert.equal(deck.length, 4);
  assert.equal(new Set(deck.map(({ key }) => key)).size, 4);
  assert.deepEqual(deck.map(({ id }) => id).sort(), ['dhol', 'dhol', 'tea', 'tea']);
});

test('ordered answers compare exact IDs', () => {
  assert.equal(evaluateOrder(['wake', 'brush'], ['wake', 'brush']), true);
  assert.equal(evaluateOrder(['brush', 'wake'], ['wake', 'brush']), false);
});

test('stage limits reduce choices without hiding binary severe content', () => {
  assert.equal(getStageLimit('mild', 3, 8), 8);
  assert.equal(getStageLimit('moderate', 2, 8), 5);
  assert.equal(getStageLimit('severe', 1, 8), 2);
});

test('score round protects division by zero', () => {
  assert.deepEqual(scoreRound(0, 0), { accuracy: 0, score: 0 });
  assert.deepEqual(scoreRound(2, 3), { accuracy: 67, score: 67 });
});

test('sequence generator creates requested repeatable pattern', () => {
  const items = [{ id: 'tea' }, { id: 'dhol' }, { id: 'lotus' }];
  const values = [0, 0.4, 0.9, 0.1];
  let index = 0;
  assert.deepEqual(createSequence(items, 4, () => values[index++]), ['tea', 'dhol', 'lotus', 'tea']);
});
