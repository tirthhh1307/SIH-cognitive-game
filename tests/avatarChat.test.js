import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChatForm, trimHistory } from '../src/utils/avatar/chatApi.js';

test('history keeps eight safe text messages', () => {
  const history = Array.from({ length: 10 }, (_, index) => ({ role: 'user', text: String(index) }));
  assert.deepEqual(trimHistory(history).map(item => item.text), ['2', '3', '4', '5', '6', '7', '8', '9']);
});

test('chat form never includes onboarding media', () => {
  const form = buildChatForm({ text: 'Hello', history: [], profileId: 'local' });
  assert.equal(form.get('text'), 'Hello');
  assert.equal(form.has('photos'), false);
  assert.equal(form.has('voiceBlob'), false);
});

test('history drops invalid roles and blank messages', () => {
  assert.deepEqual(trimHistory([
    { role: 'system', text: 'secret' },
    { role: 'user', text: '  ' },
    { role: 'model', text: 'Hello' }
  ]), [{ role: 'model', text: 'Hello' }]);
});
