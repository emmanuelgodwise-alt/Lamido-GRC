/*
 * Lamido, Lamido & Co. — service worker (Stage 1)
 * ------------------------------------------------
 * Explicit, versioned caching with a strict allowlist:
 *
 *  - Pre-cache: the offline fallback page only.
 *  - Immutable static assets (/_next/static/, /icons/, /brand/, favicons):
 *    cache-first.
 *  - Public page navigations: network-first with a runtime cache fallback,
 *    then the offline page.
 *  - NEVER cached (network-only, always): /admin/, /api/, /auth/, any
 *    cross-origin request (including Supabase API/auth), enquiry submissions,
 *    and anything carrying credentials. Private data must never enter a cache.
 *
 * Update policy: new versions wait for existing tabs to close (no mid-session
 * takeover). A "SKIP_WAITING" message listener is included for a future,
 * explicit update prompt (Stage 6).
 *
 * Version history:
 *  - llc-v1: Stage 1.
 *  - llc-v2: bumped after Stages 2-5 so every existing visitor's service
 *    worker re-installs and purges all llc-v1 caches on activation — no
 *    browser can keep serving assets cached from an earlier deployment
 *    against HTML from the current one.
 */

const VERSION = "llc-v2";
const PRECACHE = `llc-precache-${VERSION}`;
const RUNTIME = `llc-runtime-${VERSION}`;
const OFFLINE_URL = "/offline";

const NEVER_CACHE_PATHS = [
  /\/admin(\/|$)/,
  /\/api(\/|$)/,
  /\/auth(\/|$)/,
];

const IMMUTABLE_ASSETS = [
  /\/_next\/static\//,
  /\/icons\//,
  /\/brand\//,
  /\/favicon\.ico$/,
  /\/apple-touch-icon\.png$/,
  /\/manifest\.webmanifest$/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // Resilient precache: one failed asset must not block installation.
      await Promise.allSettled([
        cache.add(OFFLINE_URL),
        cache.add("/manifest.webmanifest"),
        cache.add("/favicon.ico"),
      ]);
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.endsWith(VERSION))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isNeverCache(url) {
  // All cross-origin requests are network-only (fonts are self-hosted).
  if (url.origin !== self.location.origin) return true;
  return NEVER_CACHE_PATHS.some((re) => re.test(url.pathname));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (isNeverCache(url)) {
    // Network-only. For navigations, fall back to the offline page.
    if (request.mode === "navigate") {
      event.respondWith(
        fetch(request).catch(async () => {
          const cached = await caches.match(OFFLINE_URL, {
            cacheName: PRECACHE,
          });
          return cached || Response.error();
        })
      );
    }
    return;
  }

  // Public page navigations: network-first, cache fallback, offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) {
            const cache = await caches.open(RUNTIME);
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL, {
            cacheName: PRECACHE,
          });
          return offline || Response.error();
        }
      })()
    );
    return;
  }

  // Immutable static assets: cache-first.
  if (IMMUTABLE_ASSETS.some((re) => re.test(url.pathname))) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) {
            const cache = await caches.open(RUNTIME);
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch {
          return cached || Response.error();
        }
      })()
    );
  }

  // Everything else: default network behaviour, no caching.
});
