// Service Worker para AxoloFit PWA
const CACHE_NAME = 'axolofit-v55';

// Archivos base que queremos disponibles aunque falle la red
const CORE_ASSETS = [
  '/AxoloFit.html',
  '/manifest.json',
  '/axo-icon-192.png',
  '/axo-icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => {}) // si falla la precarga, no bloqueamos la instalación
  );
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
    icon: '/axo-icon-192.png',
    badge: '/axo-icon-192.png',
    data: { url: data.url || '/AxoloFit.html' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : '/AxoloFit.html';

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
  // Todo lo demás (POST al proxy de Gemini, llamadas a Supabase, CDNs, etc.)
  // pasa de largo sin que el SW lo toque.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Guardamos una copia buena en caché para la próxima vez
        if (res && res.status === 200 && res.type === 'basic') {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copia)).catch(() => {});
        }
        return res;
      })
      .catch(() => {
        // Si la red falla, servimos lo que tengamos guardado.
        // Si tampoco hay nada en caché, dejamos que el navegador
        // maneje el error normalmente en vez de romper la carga.
        return caches.match(req).then((cacheado) => cacheado || Response.error());
      })
  );
});
