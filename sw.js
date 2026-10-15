const CACHE_NAME = 'camerlink-v6';

// Liste des fichiers clés à mettre en cache immédiatement à l'installation
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/admin.html',
  '/modele.html',
  '/style.css',
  '/profil.css',
  '/script.js',
  '/shell.js',
  '/profil-page.js',
  '/reels.css',
  '/statuts.css',
  '/shell.css',
  '/profil.css',
  '/statuts.js',
  '/register-sw.js',
  '/modifier.js',
  '/icon-192.png',
  '/icon-512.png',
  '/camerlink-logo.png',
  '/manifest.webmanifest'
];

// 1. Installation : mise en cache des fichiers statiques principaux
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Mise en cache des ressources globales');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activation : nettoyage des anciens caches obsolètes
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Suppression de l\'ancien cache :', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Interception des requêtes (Stratégie : Network First avec repli sur le cache)
self.addEventListener('fetch', event => {
  const request = event.request;

  // Ignorer les requêtes qui ne sont pas en GET ou qui proviennent d'une autre origine (ex: API Supabase externe)
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(networkResponse => {
        // Cloner la réponse réseau pour la stocker dans le cache
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // En cas de panne de réseau (hors-ligne), on cherche dans le cache
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si la ressource n'est pas dans le cache, renvoyer la page d'accueil par défaut
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

