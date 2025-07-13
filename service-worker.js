const CACHE_VERSION = "v2.8.0.6-20250713";
const CACHE_NAME = `uniqr-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/icon512",
  "/icon192",
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
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );

  self.clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((client) => client.navigate(client.url));
  });
});

// Fetch: Handle requests
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // For navigation requests, try network first, then fallback to cached index.html
    event.respondWith(
      fetch(event.request).catch(() => {
        // For navigation requests, always serve the main page regardless of query parameters
        return caches.match("/index.html") || caches.match("/");
      })
    );
  } else {
    // For static assets, try cache first, then network
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
