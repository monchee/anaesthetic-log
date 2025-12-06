const CACHE_NAME = 'anaesthetic-log-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  // External resources will be cached dynamically by the fetch handler below
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Assets
self.addEventListener('fetch', (event) => {
  // Navigation requests: serve index.html to support SPA reloading if necessary
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((response) => {
        return response || fetch(event.request);
      }).catch(() => {
         return caches.match('/index.html');
      })
    );
    return;
  }

  // General requests: Cache First, falling back to network, then caching the network response
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque')) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache valid responses (including CDNs)
            if (event.request.url.startsWith('http')) {
                caches.open(CACHE_NAME)
                .then((cache) => {
                    cache.put(event.request, responseToCache);
                });
            }

            return response;
          }
        ).catch((err) => {
            // Network failure - essentially "offline"
            console.log('Fetch failed:', err);
        });
      })
  );
});