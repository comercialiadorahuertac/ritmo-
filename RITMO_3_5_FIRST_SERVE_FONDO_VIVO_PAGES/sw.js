const CACHE_NAME = 'ritmo-app-v3.5.0';
const APP_ASSETS = ["./ambient.js", "./ambient.css", "./", "./account.js", "./manifest.webmanifest", "./fuerza.html", "./fuerza.js", "./firstserve.css", "./extras.js", "./training-core.js", "./config.js", "./performance.js", "./firstserve.js", "./training-catalog.js", "./fuerza.css", "./index.html", "./sw.js", "./app.js", "./extras.css", "./retas.js", "./styles.css", "./performance.css", "./focus-guide.js", "./media/strength/band-lateral/1.jpg", "./media/strength/band-lateral/0.jpg", "./media/strength/db-floor/1.jpg", "./media/strength/db-floor/0.jpg", "./media/strength/squat/1.jpg", "./media/strength/squat/0.jpg", "./media/strength/band-pull/1.jpg", "./media/strength/band-pull/0.jpg", "./media/strength/plank/1.jpg", "./media/strength/plank/0.jpg", "./media/strength/band-walk/1.jpg", "./media/strength/band-walk/0.jpg", "./media/strength/cat/1.jpg", "./media/strength/cat/0.jpg", "./media/strength/db-hinge/1.jpg", "./media/strength/db-hinge/0.jpg", "./media/strength/db-curl/1.jpg", "./media/strength/db-curl/0.jpg", "./media/strength/superman/1.jpg", "./media/strength/superman/0.jpg", "./media/strength/child/1.jpg", "./media/strength/child/0.jpg", "./media/strength/pushup/1.jpg", "./media/strength/pushup/0.jpg", "./media/strength/crunch/1.jpg", "./media/strength/crunch/0.jpg", "./media/strength/bridge/1.jpg", "./media/strength/bridge/0.jpg", "./media/strength/arms/1.jpg", "./media/strength/arms/0.jpg", "./media/strength/db-row/1.jpg", "./media/strength/db-row/0.jpg", "./media/strength/band-rotation/1.jpg", "./media/strength/band-rotation/0.jpg", "./media/strength/db-squat/1.jpg", "./media/strength/db-squat/0.jpg", "./media/strength/db-lunge/1.jpg", "./media/strength/db-lunge/0.jpg", "./media/strength/band-hinge/1.jpg", "./media/strength/band-hinge/0.jpg", "./media/strength/lunge/1.jpg", "./media/strength/lunge/0.jpg", "./media/strength/db-lateral/1.jpg", "./media/strength/db-lateral/0.jpg", "./media/strength/band-press/1.jpg", "./media/strength/band-press/0.jpg", "./media/strength/band-squat/1.jpg", "./media/strength/band-squat/0.jpg", "./media/strength/band-rear/1.jpg", "./media/strength/band-rear/0.jpg", "./media/strength/db-press/1.jpg", "./media/strength/db-press/0.jpg", "./icons/apple-touch-icon.png", "./icons/icon-512.png", "./icons/icon-192.png"];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('ritmo-app-') && key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok && !new URL(event.request.url).search && (APP_ASSETS.some(p=>new URL(p,self.location.href).pathname===new URL(event.request.url).pathname))) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
