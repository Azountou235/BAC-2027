const CACHE_NAME = 'bac-tchad-2027-v1';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Avoid caching Supabase API or Websocket endpoints in SW
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Cache static assets and pages
            if (url.origin === location.origin) {
              cache.put(event.request, responseToCache);
            }
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML request failed and nothing in cache, show offline page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Web Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: 'BAC TCHAD 2027', body: 'Nouveau message reçu.', url: '/app' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/app'
    },
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Ignorer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
