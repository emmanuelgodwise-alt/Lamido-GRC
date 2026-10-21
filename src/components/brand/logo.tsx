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
      aria-label={`${site.name} — home`}
      className="flex shrink-0 items-center gap-2.5 rounded-md py-1 sm:gap-3"
    >
      {/* The official emblem (symbol crop of the owner-supplied logo). */}
      <img
        src="/brand/emblem-transparent.png"
        alt=""
        width={62}
        height={40}
        className="h-9 w-auto sm:h-10"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold text-navy sm:text-[17px]">
          Lamido, Lamido &amp; Co.
        </span>
        <span className="mt-1 text-[8.5px] font-semibold uppercase tracking-[0.24em] text-gold sm:text-[9.5px]">
          Global Resource Company
        </span>
      </span>
    </Link>
  );
}
