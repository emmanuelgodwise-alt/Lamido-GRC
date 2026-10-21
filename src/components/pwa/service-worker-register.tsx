"use client";

/**
 * Registers the service worker at /sw.js on page load.
 * Fails silently in restricted contexts (e.g. sandboxed preview iframes)
 * where service worker registration is not permitted.
 */
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
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
