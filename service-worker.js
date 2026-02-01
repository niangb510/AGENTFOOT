const CACHE_NAME = 'ni-conseils-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/agent.html',
    '/players.html',
    '/services.html',
    '/contact.html',
    '/style.css',
    '/script.js',
    '/assets/images/logo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
