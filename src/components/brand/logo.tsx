import Link from "next/link";
import { site } from "@/lib/site";

/**
 * Header brand lockup: the official emblem (symbol crop from the owner-supplied
 * logo) beside the company name and descriptor. The original artwork is used
 * unmodified; no replacement logo has been invented.
 */
export function LogoLockup() {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — Global Resource Company — home`}
      className="flex shrink-0 items-center gap-2.5 rounded-md py-1 sm:gap-3"
    >
      {/* The official emblem (symbol crop of the owner-supplied logo),
          right-sized for its 36-40px display (2x for sharp rendering).
          fetchPriority=high: above-the-fold, site-wide header asset —
          loaded ahead of lower-priority resources (LCP hygiene). */}
      <img
        src="/brand/emblem-header.png"
        alt=""
        width={123}
        height={80}
        fetchPriority="high"
        decoding="async"
        className="h-9 w-auto sm:h-10"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold text-navy sm:text-[17px]">
          Lamido, Lamido &amp; Co.
        </span>
        <span className="mt-1 text-[8.5px] font-semibold uppercase tracking-[0.24em] text-gold-ink sm:text-[9.5px]">
          Global Resource Company
        </span>
      </span>
    </Link>
  );
}
