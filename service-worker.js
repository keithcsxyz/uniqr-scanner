const CACHE_VERSION = "v2.8.0.6-20250713";
const CACHE_NAME = `uniqr-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "./",
  "https://keithcsxyz.github.io/uniqr-scanner/index.html",
  "https://keithcsxyz.github.io/uniqr-scanner/manifest.json",
  "https://keithcsxyz.github.io/uniqr-scanner/assets/imgs/favicon.ico",
  "https://keithcsxyz.github.io/uniqr-scanner/assets/imgs/uniqr-scanner-icon512.png",
  "https://keithcsxyz.github.io/uniqr-scanner/assets/imgs/uniqr-scanner-icon192.png",
  "https://keithcsxyz.github.io/uniqr-scanner/assets/imgs/settings.png",
  "https://keithcsxyz.github.io/uniqr-scanner/assets/imgs/apple-touch-icon-180x180.png",
  "https://keithcsxyz.github.io/uniqr-scanner/assets/imgs/apple-touch-icon-120x120.png",
  "https://keithcsxyz.github.io/uniqr-scanner/assets/imgs/apple-touch-icon-144x144.png",
  "https://keithcsxyz.github.io/uniqr-scanner/assets/css/bootstrap.min.css",
  "https://keithcsxyz.github.io/uniqr-scanner/assets/js/sweetalert2.all.min.js",
  "https://keithcsxyz.github.io/uniqr-scanner/assets/js/html5-qrcode.min.js",
  "https://keithcsxyz.github.io/uniqr-scanner/qr-scanner-master/qr-scanner.min.js",
  "https://keithcsxyz.github.io/uniqr-scanner/assets/sounds/beep.mp3"
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
        return caches.match("https://keithcsxyz.github.io/uniqr-scanner/index.html");
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
