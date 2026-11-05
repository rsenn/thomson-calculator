// Offline cache. tools/pwa.js replaces VERSION and FILES when it builds
// dist/; in the source tree VERSION is 'dev' and nothing is cached.
//
// The whole file set is cached under one version and answered from that
// cache only, so modules of two releases are never mixed (doc/pitfalls.md).
// A new version installs in the background and takes over when the app is
// opened again after every window was closed; there is no skipWaiting.
const VERSION = 'dev';
const FILES = [];
const CACHE = `thomson-${VERSION}`;

self.addEventListener('install', event => {
  if(VERSION !== 'dev') event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('thomson-') && k !== CACHE).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if(VERSION === 'dev' || request.method !== 'GET') return;

  event.respondWith(
    caches
      .open(CACHE)
      .then(cache => cache.match(request, { ignoreSearch: true }))
      .then(hit => hit ?? fetch(request))
  );
});
