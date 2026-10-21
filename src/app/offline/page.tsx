import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, container } from "@/lib/styles";
import { OfflineRetryButton } from "./offline-retry-button";

export const metadata: Metadata = {
  title: "You Are Offline",
  description:
    "This device currently has no internet connection. Previously visited pages remain available.",
  robots: { index: false, follow: true },
};

/**
 * Offline fallback page, pre-cached by the service worker and shown whenever
 * a navigation fails while the device is offline. It never claims a form
 * submission succeeded and never queues enquiries for later sending.
 */
export default function OfflinePage() {
  return (
    <section className="bg-offwhite">
      <div
        className={cn(
          container,
          "flex flex-col items-center py-24 text-center sm:py-32"
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white ring-1 ring-line">
          <WifiOff className="h-7 w-7 text-gold" aria-hidden />
        </div>
        <h1 className="mt-8 font-display text-2xl font-semibold text-navy sm:text-3xl">
          You are offline
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/70">
          This device currently has no internet connection. Pages you have
          already visited remain available. New pages and the consultation
          enquiry form require a connection — nothing is submitted or queued
          while you are offline.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <OfflineRetryButton />
          <Link href="/" className={btn("outline")}>
            Go to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
