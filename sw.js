const CACHE = "kos-v1";
const OFFLINE_ASSETS = [
  "/my-notes/",
  "/my-notes/index.html",
  "/my-notes/manifest.json",
  "/my-notes/icon-512.png"
];

// Install: cache shell assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache for navigation
self.addEventListener("fetch", (e) => {
  // Only handle GET requests
  if (e.request.method !== "GET") return;

  // For Firebase/CDN requests go straight to network
  const url = e.request.url;
  if (url.includes("firebase") || url.includes("googleapis") || url.includes("gstatic") || url.includes("fonts.")) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache successful responses for the app shell
        if (res.ok && OFFLINE_ASSETS.some((a) => url.endsWith(a.replace("/my-notes", "")))) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
