const CACHE_PREFIX = "web-app-pwa";
const CACHE_VERSION = "v1";
const STATIC_CACHE = `${CACHE_PREFIX}-static-${CACHE_VERSION}`;
const NAV_CACHE = `${CACHE_PREFIX}-navigation-${CACHE_VERSION}`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith(CACHE_PREFIX) && ![STATIC_CACHE, NAV_CACHE].includes(key)).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) caches.open(NAV_CACHE).then((cache) => cache.put(request, response.clone()));
        return response;
      }).catch(async () => (await caches.match(request)) || (await caches.match("./")) || Response.error())
    );
    return;
  }

  if (["style", "script", "image", "font"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok && response.type === "basic") caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()));
        return response;
      }))
    );
  }
});
