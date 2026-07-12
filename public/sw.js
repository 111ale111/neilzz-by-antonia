const CACHE_VERSION = 'neilzz-push-v20';

self.addEventListener('install', () => {
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
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      tag: data.tag || `neilzz-${Date.now()}`,
      renotify: true,
      data: { url: data.url || '/account?tab=notifications' },
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: 'neilzzbyanto',
      body: event.data ? event.data.text() : '',
    };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'neilzzbyanto', {
      body: payload.body || payload.message || '',
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/icon-192.png',
      tag: payload.tag || `neilzz-${Date.now()}`,
      data: {
        url: payload.url || '/account?tab=notifications',
      },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/account?tab=notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        try {
          const sameOrigin = new URL(client.url).origin === self.location.origin;
          if (sameOrigin && 'focus' in client) {
            if ('navigate' in client) {
              return client.focus().then((focused) => (focused && focused.navigate ? focused.navigate(url) : focused));
            }
            return client.focus();
          }
        } catch {
          // ignoră URL-uri invalide
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
