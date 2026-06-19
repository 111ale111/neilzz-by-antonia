self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'neilzzbyanto', body: 'Ai o notificare nouă.' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'neilzzbyanto', {
      body: data.body || data.message || 'Ai o notificare nouă.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  );
});
