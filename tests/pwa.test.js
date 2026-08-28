import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

test('manifest provides standalone install metadata', async () => {
  const manifest = JSON.parse(await readFile('public/manifest.webmanifest', 'utf8'));
  assert.equal(manifest.name, 'Sanjibani Cognitive Companion');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/');
  assert.ok(manifest.icons.some(icon => icon.src === '/app-icon.svg'));
});

test('service worker installs the complete offline shell', async () => {
  const worker = await readFile('public/sw.js', 'utf8');
  const handlers = {};
  let installedFiles = [];
  let cachedModel = false;
  const context = {
    self: {
      location: { origin: 'https://example.test' },
      addEventListener: (name, handler) => { handlers[name] = handler; },
      skipWaiting: () => Promise.resolve(),
      clients: { claim: () => Promise.resolve() }
    },
    caches: {
      open: async () => ({
        addAll: async files => { installedFiles.push(...files); },
        put: async request => { cachedModel = request.url.endsWith('/models/avatar-companion.vrm'); }
      }),
      keys: async () => [],
      delete: async () => true,
      match: async () => undefined
    },
    fetch: async () => ({
      ok: true,
      clone() { return this; },
      text: async () => '<script src="/assets/index-abc.js"></script><link href="/assets/index-def.css">'
    }),
    URL,
    Promise
  };
  vm.runInNewContext(worker, context);
  assert.deepEqual(Object.keys(handlers).sort(), ['activate', 'fetch', 'install']);
  let installation;
  handlers.install({ waitUntil: promise => { installation = promise; } });
  await installation;
  assert.deepEqual(installedFiles, ['/', '/index.html', '/manifest.webmanifest', '/app-icon.svg', '/avatar_apoi.jpg', '/scenic_bg.jpg', '/assets/index-abc.js', '/assets/index-def.css']);
  let interceptedApi = false;
  handlers.fetch({
    request: { method: 'GET', url: 'https://example.test/api/patient', destination: '', mode: 'cors' },
    respondWith: () => { interceptedApi = true; }
  });
  assert.equal(interceptedApi, false);
  assert.equal(installedFiles.includes('/models/avatar-companion.vrm'), false);

  let modelResponse;
  handlers.fetch({
    request: {
      method: 'GET',
      url: 'https://example.test/models/avatar-companion.vrm',
      destination: '',
      mode: 'cors'
    },
    respondWith: promise => { modelResponse = promise; }
  });
  await modelResponse;
  assert.equal(cachedModel, true);
});
