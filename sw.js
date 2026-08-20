// =========================================================================
// BDCF CREW PWA SERVICE WORKER (v3.8.0)
// High-performance offline caching, asset pre-fetching & network strategy
// =========================================================================

const CACHE_NAME = 'bdcf-pwa-cache-v3.8.0';



const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './bdcf-neon-skull.png',
  './user-avatar.png',
  './icon-192.svg',
  './icon-512.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './LosSantosWeekly/index.html',
  './LosSantosWeekly/style.css',
  './LosSantosWeekly/app.js'
];

// Install Event — Pre-cache critical core shell resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('[BDCF PWA] Cache item warning:', asset, err);
        }
      }
    })
  );
  self.skipWaiting();
});


// Activate Event — Clean up stale old caches
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

// Fetch Event — Network-first with instant cache fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass cache for real-time Firebase Auth, Firestore, Google Sheets, and YouTube requests
  if (
    url.origin.includes('firebaseio.com') ||
    url.origin.includes('googleapis.com') ||
    url.origin.includes('firestore.googleapis.com') ||
    url.origin.includes('identitytoolkit.googleapis.com') ||
    url.origin.includes('youtube.com') ||
    url.origin.includes('youtube-nocookie.com') ||
    url.origin.includes('allorigins.win') ||
    url.origin.includes('api.github.com') ||
    url.searchParams.has('t')
  ) {
    return;
  }

  // Handle static assets & navigations
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache valid 200 responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline Fallback
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
