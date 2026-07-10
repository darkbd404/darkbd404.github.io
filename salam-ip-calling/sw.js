self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'Update', message: 'New notification' };
    const options = {
        body: data.message,
        icon: 'https://cdn-icons-png.flaticon.com/512/5585/5585856.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/5585/5585856.png',
        vibrate: [100, 50, 100],
        data: { dateOfArrival: Date.now(), primaryKey: '1' }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});
