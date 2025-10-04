// Define a cache name for your app's assets.
const CACHE_NAME = 'mahama-news-cache-v2';

// List the files and assets to be cached when the service worker is installed.
// This is the "app shell".
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/index.tsx',
  // Key CDN assets - caching these can significantly speed up initial load on subsequent visits.
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/react-quill@2.0.0',
  'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css',
  'https://esm.sh/chart.js@4.4.2'
];

// Installation event: fired when the service worker is first installed.
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  // waitUntil() ensures that the service worker will not be considered installed until the code inside has finished.
  event.waitUntil(
    // Open the cache.
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        // Add all the specified URLs to the cache.
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Service Worker: Caching failed', err);
      })
  );
});

// Activate event: fired when the service worker is activated.
// This is a good place to clean up old caches.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME]; // The list of caches to keep.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache is not in our whitelist, delete it.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: fired for every network request made by the page.
self.addEventListener('fetch', event => {
  // We only want to handle GET requests for caching.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Respond with the cached version if available, otherwise fetch from the network.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If the resource is in the cache, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If the resource is not in the cache, fetch it from the network.
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response.
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response because it's a stream and can only be consumed once.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cache the newly fetched resource.
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error('Service Worker: Fetch failed', error);
            // Here you could return a fallback offline page if needed.
            throw error;
        });
      })
  );
});

// Push event: fired when a push message is received.
self.addEventListener('push', event => {
  console.log('Service Worker: Push Received.');
  const data = event.data.json();

  const title = data.title || 'Mahama News TV';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/favicon.svg', // A small icon for the notification
    badge: '/favicon.svg', // An icon for mobile devices
    data: {
      url: data.url || '/', // The URL to navigate to when the notification is clicked
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event: fired when a user clicks on a notification.
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click Received.');
  
  // Close the notification.
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  // Check if there's an already open window/tab for the app and focus it.
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then(clientList => {
      for (const client of clientList) {
        // If a window for the target URL is already open, focus it.
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
