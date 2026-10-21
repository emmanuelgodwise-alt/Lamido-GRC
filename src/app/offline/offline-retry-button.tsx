"use client";

/** Client-side "Try again" button for the offline fallback page. */
export function OfflineRetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
    >
      Try again
    </button>
  );
}
