// Service Worker para AxoloFit PWA
const CACHE_NAME = 'axolofit-v25';

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

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'AxoloFit', body: event.data ? event.data.text() : '' }; }

  const title = data.title || 'Axo te extraña 🥺';
  const options = {
    body: data.body || '¡No olvides registrar tu comida de hoy!',
    icon: '/Axolofit/axo-icon-192.png',
    badge: '/Axolofit/axo-icon-192.png',
    data: { url: data.url || '/Axolofit/AxoloFit.html' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : '/Axolofit/AxoloFit.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('AxoloFit.html') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
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
