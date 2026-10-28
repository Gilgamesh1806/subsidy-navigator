// Service worker: keeps a copy of the app on the phone so it works offline
// after the first load.
//
// Bump CACHE_VERSION on every deploy. The browser then installs the new files
// in the background; the new version takes over on the next launch (no prompt
// in the middle of a demo), and the old cache is deleted.
const CACHE_VERSION = 'v2';
const CACHE = 'subsidy-navigator-' + CACHE_VERSION;

// The app shell. Paths are relative to this file, so they work on GitHub
// Pages under /subsidy-navigator/ and on localhost.
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/app.js',
  './js/reader.js',
  './js/rules.js',
  './js/draft.js',
  './js/icons.js',
  './js/data/library.js',
  './js/data/strings.js',
  './fonts/rubik-latin.woff2',
  './fonts/rubik-latin-ext.woff2',
  './fonts/nunito-sans-latin.woff2',
  './fonts/nunito-sans-latin-ext.woff2',
  './img/contour-charcoal.jpg',
  './img/contour-light.jpg',
  './img/contour-lines.png',
  './icons/icon-192.png',
  './icons/favicon-32.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  // cache: 'reload' skips the HTTP cache, so we store the fresh files.
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' }))))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name.startsWith('subsidy-navigator-') && name !== CACHE).map((name) => caches.delete(name)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch other sites (source links)

  // Opening the app: always answer with the cached page (works offline).
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE).then((cache) => cache.match('./index.html')).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Everything else: cache first, then network (and keep a copy, e.g. the
  // desktop background, which is not in the shell list).
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
      })
    )
  );
});
