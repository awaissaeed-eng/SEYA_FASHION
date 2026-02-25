// Service Worker for Media Caching
const CACHE_NAME = 'seya-fashion-media-v1';
const CLOUDINARY_CACHE = 'cloudinary-images-v1';
const CLOUDINARY_VIDEO_CACHE = 'cloudinary-videos-v1';

// Cache duration (7 days)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

/**
 * Install event - cache critical assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== CACHE_NAME && 
                   name !== CLOUDINARY_CACHE && 
                   name !== CLOUDINARY_VIDEO_CACHE;
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

/**
 * Fetch event - cache Cloudinary media
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only cache Cloudinary resources
  if (!url.hostname.includes('cloudinary.com')) {
    return;
  }

  // Determine cache based on resource type
  const isVideo = url.pathname.includes('/video/') || 
                  request.destination === 'video';
  const cacheName = isVideo ? CLOUDINARY_VIDEO_CACHE : CLOUDINARY_CACHE;

  event.respondWith(
    caches.open(cacheName).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        // Check if cached response is still valid
        if (cachedResponse) {
          const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date'));
          const now = new Date();
          
          if (now - cachedDate < CACHE_DURATION) {
            console.log('[SW] Serving from cache:', url.pathname);
            return cachedResponse;
          } else {
            console.log('[SW] Cache expired, fetching fresh:', url.pathname);
          }
        }

        // Fetch from network
        return fetch(request).then((response) => {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone response and add cache date header
          const responseToCache = response.clone();
          const headers = new Headers(responseToCache.headers);
          headers.append('sw-cached-date', new Date().toISOString());

          // Create new response with updated headers
          const cachedResponse = new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers,
          });

          // Cache the response
          cache.put(request, cachedResponse).catch((err) => {
            console.warn('[SW] Failed to cache:', err);
          });

          console.log('[SW] Cached fresh response:', url.pathname);
          return response;
        }).catch((error) => {
          console.error('[SW] Fetch failed:', error);
          // Return cached response even if expired
          return cachedResponse || new Response('Network error', { status: 408 });
        });
      });
    })
  );
});

/**
 * Message event - handle cache clearing
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      }).then(() => {
        console.log('[SW] All caches cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
