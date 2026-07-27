const CACHE_NAME = 'ni-conseils-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/agent.html',
    '/players.html',
    '/services.html',
    '/contact.html',
    '/actualites.html',
    '/style.css',
    '/script.js',
    '/site-config.js',
    '/assets/images/logo.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    const isSiteAsset = ASSETS.includes(url.pathname);

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                fetch(event.request)
                    .then((networkResponse) => {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    })
                    .catch(() => {});
                return cachedResponse;
            }

            if (isSiteAsset) {
                return fetch(event.request)
                    .then((networkResponse) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    })
                    .catch(() => caches.match('/index.html'));
            }

            return fetch(event.request);
        })
    );
});
