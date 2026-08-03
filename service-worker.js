const CACHE_NAME = 'ni-conseils-v5';
const ASSETS = [
    '/',
    '/index.html',
    '/agent.html',
    '/players.html',
    '/services.html',
    '/contact.html',
    '/actualites.html',
    '/article.html',
    '/style.css',
    '/animations.css',
    '/script.js',
    '/animations.js',
    '/site-config.js',
    '/site-data.js',
    '/news-data.js',
    '/article.js',
    '/news.json',
    '/manifest.json',
    '/cropper.min.js',
    '/cropper.min.css',
    '/supabase.js',
    '/site-database.js',
    '/assets/images/logo.png',
    '/assets/images/hero.webp',
    '/assets/images/cyriaque.webp',
    '/assets/images/dijon.webp',
    '/assets/images/player1.webp'
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

    // news.json et news-data.js : réseau d'abord (actualités toujours fraîches), cache en secours hors-ligne
    const isNewsData = url.pathname === '/news.json' || url.pathname === '/news-data.js';

    if (isNewsData) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

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
