"use client";

/**
 * "Update available" toast — recognizes a waiting service worker and offers
 * a user-controlled refresh (Stage 6 update behaviour).
 *
 * It never reloads on its own: the page refreshes only when the user clicks
 * "Refresh", so in-progress enquiry-form input and unsaved admin notes are
 * never lost to a background update. On /admin the toast additionally asks
 * the user to save unsaved work first. Escape or "Later" dismisses it for
 * the remainder of the session (per waiting worker version).
 *
 * Visible only where the service worker registers (production); silently
 * inert in development and restricted contexts.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { site } from "@/lib/site";

const FALLBACK_RELOAD_MS = 3000;

export function UpdatePrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const waitingRef = useRef<ServiceWorker | null>(null);
  const reloadOnTakeover = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let registration: ServiceWorkerRegistration | undefined;

    const announce = (worker: ServiceWorker) => {
      waitingRef.current = worker;
      setVisible(true);
    };

    const onStateChange = (event: Event) => {
      const worker = event.target as ServiceWorker;
      // "installed" while another worker already controls the page means an
      // updated worker is waiting — announce it.
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        announce(worker);
      }
    };

    const onUpdateFound = () => {
      registration?.installing?.addEventListener("statechange", onStateChange);
    };

    navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (!reg) return;
        registration = reg;
        // A previous visit may already have a worker waiting.
        if (reg.waiting && navigator.serviceWorker.controller) {
          announce(reg.waiting);
        }
        reg.addEventListener("updatefound", onUpdateFound);
      })
      .catch(() => {
        /* restricted context — ignore */
      });

    const onControllerChange = () => {
      if (reloadOnTakeover.current) {
        reloadOnTakeover.current = false;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
      registration?.removeEventListener("updatefound", onUpdateFound);
    };
  }, []);

  // Escape dismisses; the waiting worker stays waiting until the next visit.
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  function applyUpdate() {
    if (refreshing) return;
    setRefreshing(true);
    const worker = waitingRef.current;
    if (!worker) {
      window.location.reload();
      return;
    }
    reloadOnTakeover.current = true;
    worker.postMessage("SKIP_WAITING");
    // Safety net: if the takeover already happened before the listener was
    // armed (or the message was not delivered), still honour the user's
    // explicit refresh request.
    window.setTimeout(() => {
      if (reloadOnTakeover.current) {
        reloadOnTakeover.current = false;
        window.location.reload();
      }
    }, FALLBACK_RELOAD_MS);
  }

  if (!visible) return null;

  const onAdmin = pathname?.startsWith("/admin") ?? false;

  return (
    <div
      role="status"
      aria-live="polite"
      className="llc-rise fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-40 w-[min(340px,calc(100vw-2rem))] sm:left-6"
    >
      <div className="rounded-xl border border-gold/50 bg-navy p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <RefreshCw className="h-5 w-5 text-gold" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold text-white">
              A new version is available
            </p>
            <p className="mt-1 text-[13px] leading-snug text-white/70">
              Refresh to update {site.shortName}.{" "}
              {onAdmin ? "Save any unsaved work first — " : ""}your current
              page will reload.
            </p>
          </div>
        </div>
        <div className="mt-3.5 flex gap-2">
          <button
            type="button"
            onClick={applyUpdate}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-deep"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
