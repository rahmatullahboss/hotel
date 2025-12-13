const CACHE_NAME = 'vibe-manager-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
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

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip API calls and external requests
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone response for caching
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(async () => {
                // Try to get from cache
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    const offlineResponse = await caches.match(OFFLINE_URL);
                    if (offlineResponse) {
                        return offlineResponse;
                    }
                }

                // Return network error for other requests
                return new Response('Network error', {
                    status: 408,
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
    );
});

// Handle push notifications
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

// Background sync for offline check-ins
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-checkins') {
        event.waitUntil(syncPendingCheckIns());
    }
});

// Sync pending check-in actions
async function syncPendingCheckIns() {
    // Open IndexedDB
    const dbRequest = indexedDB.open('vibe-offline-db', 1);

    return new Promise((resolve, reject) => {
        dbRequest.onerror = () => reject(dbRequest.error);
        dbRequest.onsuccess = async () => {
            const db = dbRequest.result;
            const tx = db.transaction('pendingActions', 'readwrite');
            const store = tx.objectStore('pendingActions');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = async () => {
                const actions = getAllRequest.result.filter(a => !a.synced);

                for (const action of actions) {
                    try {
                        const endpoint = action.action === 'CHECK_IN'
                            ? '/api/bookings/check-in'
                            : '/api/bookings/check-out';

                        const response = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ bookingId: action.bookingId }),
                        });

                        if (response.ok) {
                            // Mark as synced
                            action.synced = true;
                            const updateTx = db.transaction('pendingActions', 'readwrite');
                            updateTx.objectStore('pendingActions').put(action);
                        }
                    } catch (error) {
                        console.error('[SW] Sync failed for action:', action.id, error);
                    }
                }

                resolve();
            };
        };
    });
}

// Cache API responses for today's bookings
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Special handling for today's bookings API
    if (url.pathname === '/api/bookings/today' && event.request.method === 'GET') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone and cache the response
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(async () => {
                    // Return cached response when offline
                    const cachedResponse = await caches.match(event.request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Return empty array if no cache
                    return new Response(JSON.stringify({ bookings: [] }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }
});
