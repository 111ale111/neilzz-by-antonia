const CACHE_VERSION = 'neilzz-stage-19-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'NEILZZ_SHOW_NOTIFICATION') return;
  const data = event.data.payload || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'neilzzbyanto', {
      body: data.body || 'Ai o notificare nouă.',
      icon: data.icon || '/icon-192.png?v=19',
      badge: data.badge || '/icon-192.png?v=19',
      tag: data.tag || `neilzz-${Date.now()}`,
      renotify: true,
      data: { url: data.url || '/account' },
    })
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'neilzzbyanto', body: 'Ai o notificare nouă.' };
  try {
    if (event.data) data = event.data.json();
  } catch (error) {
    data = { title: 'neilzzbyanto', body: event.data ? event.data.text() : 'Ai o notificare nouă.' };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'neilzzbyanto', {
      body: data.body || data.message || 'Ai o notificare nouă.',
      icon: '/icon-192.png?v=19',
      badge: '/icon-192.png?v=19',
      tag: data.tag || `neilzz-update-${Date.now()}`,
      renotify: true,
      data: { url: data.url || '/account' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/account';
  event.waitUntil(clients.openWindow(url));
});
