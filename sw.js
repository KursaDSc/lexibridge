const CACHE_NAME = 'lexibridge-cache-v13';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/aiEngine.js',
  './js/app.js',
  './manifest.json',
  './app_icon.ico',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Never cache external APIs or local LLM requests
  if (
    url.includes('googleapis.com') ||
    url.includes('nvidia.com') ||
    url.includes(':11434') ||
    url.includes('/ollama/') ||
    url.includes('translate.googleapis.com')
  ) {
    return;
  }

  // Network-First for HTML, Scripts & App Logic (Always get latest version when online)
  if (
    event.request.mode === 'navigate' ||
    url.includes('/js/') ||
    url.endsWith('.html') ||
    url.endsWith('.js')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const respClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Cache-First for static assets (images, icons, styles)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const respClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
        }
        return networkResponse;
      });
    })
  );
});
