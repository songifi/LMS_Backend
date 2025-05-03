
const CACHE_NAME = 'lms-pwa-cache-v1';
const DYNAMIC_CACHE = 'lms-dynamic-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // API calls for data that needs to be synced
  if (requestUrl.pathname.includes('/api/assignments/submit') || 
      requestUrl.pathname.includes('/api/notes/create')) {
    return handleDataSyncRequest(event);
  }
  
  // Course content requests
  if (requestUrl.pathname.includes('/api/courses/') || 
      requestUrl.pathname.includes('/api/materials/')) {
    return handleCourseContentRequest(event);
  }
  
  // Regular static asset requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(fetchResponse => {
            // Don't cache non-GET requests
            if (event.request.method !== 'GET') {
              return fetchResponse;
            }
            
            return caches.open(DYNAMIC_CACHE)
              .then(cache => {
                // Store a copy of the response in cache
                cache.put(event.request.url, fetchResponse.clone());
                return fetchResponse;
              });
          })
          .catch(() => {
            // If the request is for an HTML page, return the offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Handle course content requests with cache-first strategy
function handleCourseContentRequest(event) {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          // Try to update the cache in the background
          updateCache(event.request);
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            return caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          })
          .catch(() => {
            // If we can't get from network, return appropriate fallback
            return new Response(JSON.stringify({ 
              error: 'You are offline. This content is not available offline.' 
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
      })
  );
}

// Function to update cache in the background
function updateCache(request) {
  fetch(request)
    .then(response => {
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          cache.put(request, response);
        });
    })
    .catch(err => console.log('Background fetch failed:', err));
}

// Handle data sync requests (POST/PUT)
function handleDataSyncRequest(event) {
  // Clone the request to use it later
  const requestClone = event.request.clone();
  
  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(err => {
        // If offline, store the request in IndexedDB for later sync
        return requestClone.json()
          .then(body => {
            return saveRequestForSync({
              url: requestClone.url,
              method: requestClone.method,
              headers: Array.from(requestClone.headers.entries()),
              body: body
            })
            .then(() => {
              // Return a successful response so the app thinks it worked
              return new Response(JSON.stringify({
                success: true,
                offlineSync: true,
                message: 'Your data has been saved and will be submitted when you are back online.'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
          });
      })
  );
}

// Save request data for later synchronization
function saveRequestForSync(requestData) {
  return idbKeyval.set(`sync-${Date.now()}`, requestData);
}

// Background sync event
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(syncPendingRequests());
  }
});

// Sync all pending requests when online
function syncPendingRequests() {
  return idbKeyval.keys()
    .then(keys => {
      const syncRequests = keys.filter(key => key.startsWith('sync-'));
      
      return Promise.all(syncRequests.map(key => {
        return idbKeyval.get(key)
          .then(requestData => {
            return fetch(requestData.url, {
              method: requestData.method,
              headers: new Headers(requestData.headers),
              body: JSON.stringify(requestData.body)
            })
            .then(response => {
              if (response.ok) {
                return idbKeyval.delete(key);
              }
            })
            .catch(err => console.log('Sync failed:', err));
          });
      }));
    });
}

// Push notification event
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Simple IndexedDB key-value store implementation
const idbKeyval = (() => {
  const dbName = 'lms-sync-store';
  const storeName = 'pending-requests';
  let dbPromise;

  const getDB = () => {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, 1);
        
        openRequest.onupgradeneeded = () => {
          const db = openRequest.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        };
        
        openRequest.onsuccess = () => resolve(openRequest.result);
        openRequest.onerror = () => reject(openRequest.error);
      });
    }
    return dbPromise;
  };

  return {
    get(key) {
      return getDB().then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(key);
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      });
    },
    set(key, value) {
      return getDB().then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.put(value, key);
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });
    },
    delete(key) {
      return getDB().then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.delete(key);
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });
    },
    keys() {
      return getDB().then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.getAllKeys();
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      });
    }
  };
})();