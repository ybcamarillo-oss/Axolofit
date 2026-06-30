// Service Worker para AxoloFit PWA
const CACHE_NAME = 'axolofit-v7';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo manejamos GET de nuestro mismo origen.
  // Todo lo demás (POST al proxy de Gemini, llamadas a Supabase, etc.)
  // pasa de largo sin que el SW lo toque.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
