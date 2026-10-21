"use client";

/**
 * Central install-ability state for the Lamido, Lamido & Co. PWA.
 *
 * Captures the browser's `beforeinstallprompt` event so any UI (banner,
 * header/footer buttons) can trigger the native install flow. All listeners
 * are guarded so restricted contexts (e.g. sandboxed preview iframes) fail
 * silently and safely.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallOutcome = "accepted" | "dismissed" | null;

interface InstallContextValue {
  /** True when the browser has fired beforeinstallprompt and is ready to install. */
  canInstall: boolean;
  /** True when the app is already running as an installed PWA. */
  isInstalled: boolean;
  /** Triggers the native install prompt. Returns the user's choice, or null if unavailable. */
  promptInstall: () => Promise<InstallOutcome>;
}

const InstallContext = createContext<InstallContextValue>({
  canInstall: false,
  isInstalled: false,
  promptInstall: async () => null,
});

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      // Keep the event for our own UI; suppress the browser's default mini-infobar.
      event.preventDefault();
      deferredRef.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    const onInstalled = () => {
      deferredRef.current = null;
      setCanInstall(false);
      setIsInstalled(true);
    };
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const syncStandalone = () => {
      if (mediaQuery.matches) setIsInstalled(true);
    };

    syncStandalone();
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    mediaQuery.addEventListener("change", syncStandalone);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      mediaQuery.removeEventListener("change", syncStandalone);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    const deferred = deferredRef.current;
    if (!deferred) return null;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        deferredRef.current = null;
        setCanInstall(false);
      }
      return outcome;
    } catch {
      // Restricted context or the event was already consumed.
      return null;
    }
  }, []);

  return (
    <InstallContext.Provider value={{ canInstall, isInstalled, promptInstall }}>
      {children}
    </InstallContext.Provider>
  );
}

export function useInstall() {
  return useContext(InstallContext);
}
