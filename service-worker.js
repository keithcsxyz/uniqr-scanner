const CACHE_VERSION = "v2.8.1.2-20250713";
const CACHE_NAME = `uniqr-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/imgs/uniqrfavicon.ico",
  "/assets/imgs/uniqr-scanner-icon512.png",
  "/assets/imgs/uniqr-scanner-icon192.png",
  "/assets/imgs/settings.png",
  "/assets/imgs/apple-touch-icon-180x180.png",
  "/assets/imgs/apple-touch-icon-120x120.png",
  "/assets/imgs/apple-touch-icon-144x144.png",
  "/assets/css/bootstrap.min.css",
  "/assets/js/sweetalert2.all.min.js",
  "/assets/js/html5-qrcode.min.js",
  "/qr-scanner-master/qr-scanner.min.js",
  "/assets/sounds/beep.mp3"
];

// Install: Pre-cache files
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

// Activate: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    ).then(() => self.clients.claim())
  );

  self.clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((client) => client.navigate(client.url));
  });
});

// Fetch: Serve from cache or network
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("index.html"))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) =>
        cachedResponse || fetch(event.request)
      )
    );
  }
});
