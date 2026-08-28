import test from 'node:test';
import assert from 'node:assert/strict';
import { t } from '../src/data/i18n.js';

test('companion controls have English and Assamese labels', () => {
  for (const language of ['en', 'as']) {
    assert.notEqual(t(language, 'companion.send'), 'companion.send');
    assert.notEqual(t(language, 'companion.speak'), 'companion.speak');
    assert.notEqual(t(language, 'companion.returnHome'), 'companion.returnHome');
  }
});
