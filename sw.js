// ═══════════════════════════════════════════════════════════════════
// Service Worker — ESSAM (Acupuntura Musical)
// Objetivo (iteración 4): que la app sea instalable y que el "app
// shell" (HTML/CSS/JS estático — todo lo que es gratis: correspondencias,
// escalas, buscador, UI) funcione sin conexión una vez visitado.
//
// REGLA DE ORO: nada bajo /api/ se cachea jamás. Ahí vive la sesión,
// el precio, y el contenido premium servido con verificación de
// `unlocked` (server/server.js). Cachear esas respuestas podría dejar
// a alguien con un candado abierto (o cerrado) desactualizado offline.
// ═══════════════════════════════════════════════════════════════════

// Subir este número cada vez que cambie la lista de PRECACHE_FILES o
// el contenido de css/js — así el navegador descarga la versión nueva
// en vez de servir la cacheada indefinidamente.
const CACHE_VERSION = 'essam-v1';

const PRECACHE_FILES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-512-maskable.png',

  '/css/block_00_anon.css',
  '/css/block_01_anon.css',
  '/css/block_02_anon.css',
  '/css/block_03_anon.css',
  '/css/block_04_anon.css',
  '/css/block_05_warm-ivory-deep-graphite-theme.css',
  '/css/block_06_editorial-full-theme.css',
  '/css/block_07_anon.css',
  '/css/block_09_anon.css',
  '/css/premium-lock.css',

  '/js/core/auth-client.js',
  '/js/core/bootstrap.js',
  '/js/core/navigation.js',
  '/js/core/pwa.js',
  '/js/core/splash.js',

  '/js/data/appendix-b.js',
  '/js/data/bazi-iching.js',
  '/js/data/correspondencias.js',
  '/js/data/i18n-data.js',
  '/js/data/mtc-patterns.js',
  '/js/data/music-theory.js',

  '/js/features/audio.js',
  '/js/features/bazi.js',
  '/js/features/buscador.js',
  '/js/features/correspondencias.js',
  '/js/features/dodecaedro.js',
  '/js/features/escalas.js',
  '/js/features/hexagramas.js',
  '/js/features/i18n-apply.js',
  '/js/features/i18n-helpers.js',
  '/js/features/lector.js',
  '/js/features/mtc-motor.js',
  '/js/features/mtc-translation-helpers.js',
  '/js/features/music-theory-runtime.js',
  '/js/features/oraculo.js',
  '/js/features/organos.js',
  '/js/features/pdf-export.js',
  '/js/features/reproductor-oracular.js',
  '/js/features/triadas.js',
  '/js/features/tts.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // addAll falla entero si UN solo archivo da 404 — se usa un
      // catch por archivo para que uno roto no tire todo el precache.
      Promise.all(
        PRECACHE_FILES.map((url) =>
          cache.add(url).catch((e) => console.warn('[SW] no se pudo precachear', url, e))
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nunca tocar /api/ — siempre red, nunca cache, sin fallback offline.
  // (sesión, /api/price, /api/data/:filename con contenido premium)
  if (url.pathname.startsWith('/api/')) {
    return; // deja que el navegador lo maneje directo, sin interceptar
  }

  // Solo interceptar mismo origen (no el SDK de Three.js/CDN, fonts, etc.)
  if (url.origin !== self.location.origin) return;

  // Estrategia para el app shell: stale-while-revalidate — sirve lo
  // cacheado al instante (rápido y funciona offline) y en paralelo
  // pide la versión nueva a la red para la próxima vez.
  event.respondWith(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached); // sin red y sin cache -> undefined, ver abajo
        return cached || networkFetch;
      })
    )
  );
});
