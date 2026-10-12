'use strict';
const CACHE_NAME = 'camerlink-shell-v3';
const SHELL = ['/', '/manifest.json', '/camerlink-icon.svg', '/camerlink-nextgen.css', '/camerlink-nextgen.js'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // A single optional asset must not prevent the entire service worker from installing.
    await Promise.all(SHELL.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (response.ok) await cache.put(url, response);
      } catch (_) { /* Online resources will be fetched on demand. */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('camerlink-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put('/', response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) || (await caches.match('/')) || Response.error();
      }
    })());
    return;
  }
  // Only cache successful same-origin GET responses; never cache errors.
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (_) {
      return (await caches.match(request)) || Response.error();
    }
  })());
});
