const CACHE_NAME = 'palghar-tourism-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/palghar-tourism/palghar-website/about.html',
    '/palghar-tourism/palghar-website/activities.html',
    '/travel-guide.html',
    '/accommodation.html',
    '/palghar-tourism/palghar-website/contact.html',
    '/404.html',
    '/privacy-policy.html',
    '/terms.html',
    '/destinations/index.html',
    '/destinations/dahanu-beach.html',
    '/assets/js/main.js',
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
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
});

// Fetch Event Strategy (Cache First, then Network)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if found
                if (response) {
                    return response;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response as it can only be consumed once
                        const responseToCache = response.clone();

                        // Add the new response to cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
});

// Handle Push Notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore Palghar',
                icon: '/assets/icons/explore-32x32.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icons/close-32x32.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Palghar Tourism', options)
    );
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background Sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(
            // Implement form data sync logic here
            Promise.resolve()
        );
    }
});