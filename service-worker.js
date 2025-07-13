const CACHE_VERSION = "v2.8.0.9-20250713";
const CACHE_NAME = `uniqr-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/uniqr-scanner/",
  "/uniqr-scanner/index.html",
  "/uniqr-scanner/manifest.json",
  "/uniqr-scanner/assets/imgs/favicon.ico",
  "/uniqr-scanner/assets/imgs/uniqr-scanner-icon512.png",
  "/uniqr-scanner/assets/imgs/uniqr-scanner-icon192.png",
  "/uniqr-scanner/assets/imgs/settings.png",
  "/uniqr-scanner/assets/imgs/apple-touch-icon-180x180.png",
  "/uniqr-scanner/assets/imgs/apple-touch-icon-120x120.png",
  "/uniqr-scanner/assets/imgs/apple-touch-icon-144x144.png",
  "/uniqr-scanner/assets/css/bootstrap.min.css",
  "/uniqr-scanner/assets/js/sweetalert2.all.min.js",
  "/uniqr-scanner/assets/js/html5-qrcode.min.js",
  "/uniqr-scanner/qr-scanner-master/qr-scanner.min.js",
  "/uniqr-scanner/assets/sounds/beep.mp3"
];

// Install: Pre-cache all necessary files
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );

  self.clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((client) => client.navigate(client.url));
  });
});

// Fetch: Handle requests
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // Try network first, fallback to cached index.html
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/uniqr-scanner/index.html");
      })
    );
  } else {
    // For static assets: try cache, then network
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
