"use client";

/**
 * Install-on-first-visit banner.
 *
 * - Chrome/Edge/Android: appears as soon as the browser fires
 *   `beforeinstallprompt` (typically seconds after a first visit) and offers
 *   the native install flow via the provider.
 * - iOS Safari (no native prompt): shows one-time "Add to Home Screen"
 *   guidance, never repeated.
 * - Dismissal is remembered for 7 days; installed users never see it.
 * - Escape dismisses; entrance animation respects reduced motion.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, Share, SquarePen, X } from "lucide-react";
import { useInstall } from "./install-provider";
import { site } from "@/lib/site";

const DISMISS_KEY = "llc.install.dismissedAt";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const IOS_HINT_KEY = "llc.install.iosHintShown";

type Mode = "hidden" | "native" | "ios";

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

export function InstallBanner() {
  const { canInstall, isInstalled, promptInstall } = useInstall();
  const [mode, setMode] = useState<Mode>("hidden");
  const canInstallRef = useRef(canInstall);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    canInstallRef.current = canInstall;
  }, [canInstall]);

  useEffect(() => {
    if (isInstalled || isStandalone()) return;

    // Respect a recent dismissal.
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) return;
    } catch {
      /* storage unavailable — continue */
    }

    if (canInstall) {
      const timer = setTimeout(() => setMode("native"), 500);
      return () => clearTimeout(timer);
    }

    // iOS Safari never fires beforeinstallprompt — one-time guidance instead.
    if (isIOS()) {
      let shown = false;
      try {
        shown = localStorage.getItem(IOS_HINT_KEY) === "1";
      } catch {
        /* storage unavailable */
      }
      if (!shown) {
        const timer = setTimeout(() => {
          if (!canInstallRef.current) setMode("ios");
        }, 1800);
        return () => clearTimeout(timer);
      }
    }
  }, [canInstall, isInstalled]);

  // Escape dismisses whichever variant is visible.
  useEffect(() => {
    if (mode === "hidden") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMode("hidden");
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mode]);

  // While the fixed banner is visible, reserve matching space at the page
  // bottom so the footer's last line can always be scrolled clear of it.
  useEffect(() => {
    if (mode === "hidden") {
      document.body.style.paddingBottom = "";
      return;
    }
    const el = bannerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const needed = Math.max(0, window.innerHeight - rect.top) + 24;
      document.body.style.paddingBottom = `${Math.ceil(needed)}px`;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      document.body.style.paddingBottom = "";
    };
  }, [mode]);

  if (mode === "hidden") return null;

  function dismissAndRemember() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* storage unavailable */
    }
    setMode("hidden");
  }

  function dismissIosForever() {
    try {
      localStorage.setItem(IOS_HINT_KEY, "1");
    } catch {
      /* storage unavailable */
    }
    setMode("hidden");
  }

  async function accept() {
    const outcome = await promptInstall();
    // Hide in all cases; "dismissed" (user closed the native UI) is respected
    // for this session only — the 7-day block applies to the banner's own X.
    if (outcome === null) dismissAndRemember();
    else setMode("hidden");
  }

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Install the app"
      className="llc-rise fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 sm:left-auto sm:right-6 sm:w-[380px]"
    >
      <div className="rounded-xl border border-gold/50 bg-navy p-4 shadow-2xl sm:p-5">
        {mode === "native" ? (
          <>
            <div className="flex items-start gap-3">
              <img
                src="/icons/icon-192.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-white">
                  Install the app
                </p>
                <p className="mt-1 text-[13px] leading-snug text-white/70">
                  Add {site.name} to your home screen for quick, app-like access
                  — including offline reading of pages you have visited.
                </p>
              </div>
              <button
                type="button"
                onClick={dismissAndRemember}
                aria-label="Dismiss install prompt"
                className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <button
              type="button"
              onClick={() => void accept()}
              className="mt-3.5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-deep"
            >
              <ArrowDownToLine className="h-4 w-4" aria-hidden />
              Install
            </button>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <ArrowDownToLine className="h-5 w-5 text-gold" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-white">
                  Install on iPhone or iPad
                </p>
                <ol className="mt-2 space-y-1.5 text-[13px] leading-snug text-white/75">
                  <li className="flex items-center gap-2">
                    <Share className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                    Tap the Share button in your browser&apos;s toolbar.
                  </li>
                  <li className="flex items-center gap-2">
                    <SquarePen className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                    Choose &ldquo;Add to Home Screen&rdquo;.
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowDownToLine className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                    Tap &ldquo;Add&rdquo; to install the app.
                  </li>
                </ol>
              </div>
              <button
                type="button"
                onClick={dismissIosForever}
                aria-label="Dismiss install guidance"
                className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <button
              type="button"
              onClick={dismissIosForever}
              className="mt-3.5 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Got it
            </button>
          </>
        )}
      </div>
    </div>
  );
}
