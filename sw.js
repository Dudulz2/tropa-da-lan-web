const CACHE = "tropa-v6-shell-6";
const SHELL = ["./", "./index.html", "./styles.css", "./app.js", "./config.js", "./logo.svg", "./logo-wordmark.svg", "./icon-192.png", "./icon-512.png", "./manifest.webmanifest"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copy)); return res; }).catch(() => caches.match("./index.html")));
    return;
  }
  if (["app.js", "styles.css", "config.js", "manifest.webmanifest"].some((name) => url.pathname.endsWith(name))) {
    event.respondWith(fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; }).catch(() => caches.match(req)));
    return;
  }
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })));
});
