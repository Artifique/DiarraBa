// public/sw.js
const CACHE_NAME = "diarraba-volailles-cache-v1";

// Installation du Service Worker et saut direct de l'attente
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activation et suppression des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes HTTP (Network-First avec Fallback sur Cache)
self.addEventListener("fetch", (event) => {
  // Ignorer les requêtes non GET
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Ignorer les requêtes d'extensions, Next.js hot-reloads ou appels API dynamiques
  if (
    url.pathname.startsWith("/api") || 
    url.pathname.startsWith("/_next") || 
    !url.protocol.startsWith("http")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Ne mettre en cache que les réponses valides
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // En cas de coupure réseau complète, renvoyer la ressource du cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si rien n'est dans le cache et qu'on accède à une page, renvoyer la racine (page de login/accueil)
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
      })
  );
});
