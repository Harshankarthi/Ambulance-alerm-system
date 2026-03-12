// Service Worker for Push Notifications
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'Emergency Alert',
    icon: '/ambulance-icon.svg',
    badge: '/ambulance-icon.svg',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'ambulance-alert',
    requireInteraction: true,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🚑 Ambulance Alert', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow(event.notification.data.url || '/');
    })
  );
});
