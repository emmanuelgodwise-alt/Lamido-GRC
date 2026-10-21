import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { btn, container } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you are looking for does not exist or may have been moved.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="bg-white">
      <div className={cn(container, "flex flex-col items-center py-24 text-center sm:py-32")}>
        <p className="font-display text-5xl font-semibold text-gold sm:text-6xl">
          404
        </p>
        <h1 className="mt-6 font-display text-2xl font-semibold text-navy sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/70">
          The page you are looking for does not exist or may have been moved.
          The links below will take you back to familiar ground.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={btn("primary")}>
            Return Home
          </Link>
          <Link href="/services" className={btn("outline")}>
            View Our Services
          </Link>
        </div>
      </div>
    </section>
  );
}

