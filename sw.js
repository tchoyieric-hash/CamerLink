/* CamerLink PWA service worker — cache limité aux ressources statiques publiques. */
'use strict';
const CACHE_NAME = 'camerlink-v9-growth-suite';
const APP_SHELL = ['/', '/index.html', '/style.css', '/profil.css', '/script.js', '/shell.js', '/profil-page.js', '/profil-public.js', '/reels.css', '/statuts.css', '/shell.css', '/statuts.js', '/register-sw.js', '/camerlink-premium.css', '/camerlink-growth-suite.css', '/camerlink-growth-suite.js', '/camerlink-logo.png', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png', '/apple-touch-icon.png', '/favicon-32.png', '/manifest.webmanifest', '/confidentialite.html', '/conditions.html'];
const STATIC_PREFIXES = ['/style.css','/profil.css','/script.js','/shell.js','/profil-page.js','/profil-public.js','/reels.css','/statuts.css','/shell.css','/statuts.js','/register-sw.js','/camerlink-premium.css','/camerlink-growth-suite.css','/camerlink-growth-suite.js','/camerlink-logo.png','/icon-','/apple-touch-icon.png','/favicon-'];
function isPublicStatic(url) { return url.origin === self.location.origin && STATIC_PREFIXES.some(prefix => url.pathname === prefix || url.pathname.startsWith(prefix)); }
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async path => { try { const response = await fetch(path, { cache: 'reload' }); if (response.ok) await cache.put(path, response); } catch (_) {} }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => { const keys = await caches.keys(); await Promise.all(keys.filter(key => key.startsWith('camerlink-') && key !== CACHE_NAME).map(key => caches.delete(key))); await self.clients.claim(); })());
});
self.addEventListener('fetch', event => {
  const request = event.request; if (request.method !== 'GET') return;
  const url = new URL(request.url); if (url.origin !== self.location.origin) return;
  if (/^\/(api|admin(?:\.html)?|annonce\/|artisan\/|monetisation\.html|sitemap\.xml)(?:\/|$)/i.test(url.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => { try { return await fetch(request); } catch (_) { if (url.pathname === '/' || url.pathname === '/index.html') return (await caches.match('/index.html')) || (await caches.match('/')); return new Response('Vous êtes hors ligne. Reconnectez-vous pour ouvrir cette page.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}); } })()); return;
  }
  if (!isPublicStatic(url)) return;
  event.respondWith((async () => { const cache = await caches.open(CACHE_NAME); const cached = await cache.match(request); if (cached) return cached; try { const response = await fetch(request); if (response.ok) await cache.put(request,response.clone()); return response; } catch (_) { return cached || Response.error(); } })());
});