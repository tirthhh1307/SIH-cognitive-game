const CACHE_NAME = 'cognitive-platform-shell-v2';
const SHELL_FILES = ['/', '/index.html', '/manifest.webmanifest', '/app-icon.svg', '/avatar_apoi.jpg', '/scenic_bg.jpg'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL_FILES);
    const indexResponse = await fetch('/index.html');
    const html = await indexResponse.text();
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g)].map(match => match[1]);
    if (assets.length) await cache.addAll([...new Set(assets)]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const staticDestinations = ['document', 'script', 'style', 'image', 'font'];
  const isAvatarModel = url.pathname.startsWith('/models/');
  if (event.request.mode !== 'navigate' && !isAvatarModel && !staticDestinations.includes(event.request.destination)) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      if (event.request.mode === 'navigate') return caches.match('/index.html');
      return new Response('Offline asset unavailable', { status: 503 });
    }
  })());
});
