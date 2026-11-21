const CACHE_NAME = 'behocvui-v7';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/audio.js',
  './js/wallet.js',
  './js/app.js',
  './js/phonics-data.js',
  './js/phonics.js',
  './js/lessons-data.js',
  './js/lessons.js',
  './js/minigame.js',
  './js/minigame-more.js',
  './js/math-lab.js',
  './js/spell-lab.js',
  './audio/phonemes/index.json',
  './audio/voice/index.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);

    // Best-effort cache of custom phoneme recordings listed in audio/phonemes/index.json
    try {
      const res = await fetch('./audio/phonemes/index.json', { cache: 'no-cache' });
      if (res.ok) {
        const keys = await res.json();
        if (Array.isArray(keys) && keys.length > 0) {
          await Promise.allSettled(
            keys
              .filter((k) => typeof k === 'string' && k.trim())
              .map((k) => cache.add(`./audio/phonemes/${k.trim()}.mp3`))
          );
        }
      }
    } catch (_) {
      // Ignore if offline or index.json unavailable
    }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Same-origin: Network-First (auto-update when online, offline cache fallback)
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const freshRes = await fetch(new Request(req.url, { cache: 'no-cache' }));
        if (freshRes && freshRes.ok) {
          await cache.put(req, freshRes.clone());
          return freshRes;
        }
        if (freshRes && freshRes.status < 500) {
          return freshRes;
        }
      } catch (_) {
        // Offline or network error -> fall back to cache below
      }

      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;

      if (req.mode === 'navigate') {
        const fallbackIndex = await caches.match('./index.html');
        if (fallbackIndex) return fallbackIndex;
      }

      return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    })());
    return;
  }

  // Google Fonts: Network-first with cache fallback
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const freshRes = await fetch(req);
        if (freshRes && freshRes.ok) {
          await cache.put(req, freshRes.clone());
        }
        return freshRes;
      } catch (_) {
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response('', { status: 504, statusText: 'Gateway Timeout' });
      }
    })());
  }
});
