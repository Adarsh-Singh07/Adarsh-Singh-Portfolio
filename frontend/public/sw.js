/**
 * Adarsh Singh Portfolio — conservative service worker.
 *
 * Goals: installable PWA, instant repeat loads, offline shell.
 * Rules:
 *  - NEVER cache /api/* (all backend data stays fresh, zero stale-content risk).
 *  - Cache-first for same-origin hashed static assets (JS/CSS/images/fonts) —
 *    Vite fingerprints these, so a cache hit can never be stale.
 *  - Network-first for HTML navigations, with the cached shell as offline fallback.
 *  - Stale-while-revalidate for Google Fonts.
 */
const CACHE = 'adarsh-portfolio-v1';

const STATIC_ASSET_RE = /\.(js|css|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|pdf)(\?|#|$)/i;

self.addEventListener('install', (event) => {
  // Take over immediately on new deploys so users never sit on an old worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function putInCache(request, response) {
  const copy = response.clone();
  caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. API traffic is never cached — always live.
  if (url.pathname.startsWith('/api/')) return;

  // 2. Navigations: network first, fall back to the cached app shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          putInCache('/index.html', response);
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 3. Same-origin static assets (hashed by Vite): cache first.
  if (url.origin === self.location.origin && STATIC_ASSET_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response && response.ok) putInCache(request, response);
            return response;
          })
      )
    );
    return;
  }

  // 4. Google Fonts: stale-while-revalidate.
  if (url.origin.includes('fonts.g')) {
    event.respondWith(
      caches.match(request).then((hit) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.ok) putInCache(request, response);
            return response;
          })
          .catch(() => hit);
        return hit || network;
      })
    );
  }
});
