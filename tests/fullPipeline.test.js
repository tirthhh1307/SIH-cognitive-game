import test from 'node:test';
import assert from 'node:assert/strict';
import { sendChat } from '../src/utils/avatar/chatApi.js';
import { createSpeechVisemeEvents } from '../src/utils/avatar/speechVisemes.js';

test('text chat response drives accessibility-speech mouth movement', async () => {
  let submittedForm;
  const response = await sendChat(
    { text: 'Hello', history: [], profileId: 'local' },
    {
      fetchImpl: async (_url, request) => {
        submittedForm = request.body;
        return {
          ok: true,
          json: async () => ({ inputText: 'Hello', text: 'Hello. It is good to hear from you.' })
        };
      }
    }
  );

  assert.equal(submittedForm.get('text'), 'Hello');
  assert.equal(submittedForm.has('photos'), false);
  assert.equal(response.text, 'Hello. It is good to hear from you.');

  const updates = [];
  const events = createSpeechVisemeEvents(weights => updates.push(weights), {
    setTimeout: () => 1,
    clearTimeout: () => {}
  });
  events.onBoundary({ charIndex: 0 }, response.text);
  assert.ok(updates.at(-1).jawOpen > 0);
  events.onEnd();
  assert.equal(updates.at(-1).jawOpen, 0);
});
