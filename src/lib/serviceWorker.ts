// Service Worker para caching offline

const CACHE_NAME = 'alkilator-v1';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

// Registrar Service Worker
export async function registerServiceWorker() {
  if (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    import.meta.env.PROD
  ) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            dispatchEvent(
              new CustomEvent('swUpdate', { detail: registration })
            );
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
    }
  }
}

// Desregistrar Service Worker
export async function unregisterServiceWorker() {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
    } catch {
      // Ignorar si no hay registro
    }
  }
}

// Contenido del Service Worker (generar public/sw.js en build o copiar manualmente)
export const serviceWorkerContent = `
const STATIC_CACHE = 'alkilator-static-v1';
const DYNAMIC_CACHE = 'alkilator-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, clone);
        });
        return response;
      });
    })
  );
});
`;
