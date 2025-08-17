const CACHE_VERSION = "v2.8.2.6-20250713";
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
  "/assets/js/jsQR.js",
  "/qr-scanner-master/qr-scanner.min.js"
  // "/assets/sounds/beep.mp3" <- manually cached below
];

// ✅ Install: Pre-cache files and manually cache beep.mp3
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);

      // ✅ Manually fetch and cache beep.mp3
      try {
        const res = await fetch("/assets/sounds/beep.mp3");
        if (res.ok || res.status === 206) {
          await cache.put("/assets/sounds/beep.mp3", res.clone());
          //console.log("✅ beep.mp3 manually cached.");
        } else {
          //console.warn("⚠️ Failed to fetch beep.mp3:", res.status);
        }
      } catch (err) {
        //console.error("❌ Error caching beep.mp3:", err);
      }
    })()
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
