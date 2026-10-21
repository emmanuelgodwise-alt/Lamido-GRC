"use client";

/**
 * Registers the service worker at /sw.js on page load — production only.
 *
 * Why not in development: dev-server chunks are not content-hashed, so a
 * cache-first service worker would keep serving JavaScript from BEFORE the
 * latest edits while the dev server renders fresh HTML — the client tree no
 * longer matches the server HTML and React reports a hydration mismatch.
 * Testing install/offline behaviour therefore uses a production build
 * (`bun run build && npx serve out`).
 *
 * As a self-healing measure, development also unregisters any service worker
 * and clears `llc-*` caches left over from earlier sessions, so a browser
 * that once registered the dev worker recovers on the next visit.
 *
 * Fails silently in restricted contexts (e.g. sandboxed preview iframes)
 * where the relevant browser APIs are not permitted.
 */
import { useEffect } from "react";

const LLC_CACHE_PREFIX = "llc-";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      // Development: never register, and remove stale state so no browser
      // can end up running old cached JavaScript against fresh HTML.
      (async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.allSettled(registrations.map((r) => r.unregister()));
        } catch {
          /* restricted context — ignore */
        }
        try {
          const keys = await caches.keys();
          await Promise.allSettled(
            keys
              .filter((key) => key.startsWith(LLC_CACHE_PREFIX))
              .map((key) => caches.delete(key))
          );
        } catch {
          /* restricted context — ignore */
        }
      })();
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Restricted context — safe to ignore. The site still works online.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
