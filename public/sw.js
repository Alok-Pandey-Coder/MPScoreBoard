// Self-unregister and clear all stale caches
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim()).then(() => {
      return self.registration.unregister();
    })
  );
});

// Always bypass cache: direct network
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
