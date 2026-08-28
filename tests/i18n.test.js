import test from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGES, t } from '../src/data/i18n.js';

test('language list exposes supported regional languages', () => {
  assert.ok(LANGUAGES.en);
  assert.ok(LANGUAGES.as);
  assert.ok(LANGUAGES.hi);
  assert.ok(LANGUAGES.mni);
  assert.ok(LANGUAGES.trp);
});

test('Assamese translation falls back to English for missing keys', () => {
  assert.equal(t('as', 'actions.play'), 'খেলক');
  assert.equal(t('hi', 'actions.play'), 'खेलें');
  assert.equal(t('mni', 'actions.play'), 'শানসি');
  assert.equal(t('trp', 'actions.play'), 'খুলুক');
});

test('translation replaces named tokens without evaluating text', () => {
  assert.equal(t('en', 'feedback.welcome', { name: 'Mina' }), 'Wonderful work, Mina!');
  assert.equal(t('hi', 'feedback.welcome', { name: 'Mina' }), 'बहुत सुंदर प्रयास, Mina!');
});
