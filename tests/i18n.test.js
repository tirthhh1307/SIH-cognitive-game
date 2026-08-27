import test from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGES, t } from '../src/data/i18n.js';

test('language list exposes English and Assamese pilot', () => {
  assert.deepEqual(LANGUAGES, { en: 'English', as: 'অসমীয়া' });
});

test('Assamese translation falls back to English for missing keys', () => {
  assert.equal(t('as', 'app.localOnly'), t('en', 'app.localOnly'));
  assert.equal(t('as', 'actions.play'), 'খেলক');
});

test('translation replaces named tokens without evaluating text', () => {
  assert.equal(t('en', 'feedback.welcome', { name: 'Mina' }), 'Wonderful work, Mina!');
});
