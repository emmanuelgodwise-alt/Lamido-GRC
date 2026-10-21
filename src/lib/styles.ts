/**
 * Shared style primitives for the Lamido, Lamido & Co. design system.
 * Server-component safe (pure string utilities).
 */
import { cn } from "@/lib/utils";

/** Responsive page container. */
export const container = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

/** Consistent vertical section rhythm. */
export const sectionSpacing = "py-16 sm:py-20 lg:py-24";

export type ButtonVariant = "primary" | "gold" | "outline" | "ghost-light";

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-colors";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-navy text-white hover:bg-navy-deep",
  gold: "bg-gold text-navy hover:bg-gold-deep",
  outline: "border border-navy/25 bg-transparent text-navy hover:border-navy/60 hover:bg-navy/5",
  "ghost-light": "border border-white/30 bg-transparent text-white hover:bg-white/10",
};

/** Brand button styles for Link/button elements. */
export function btn(variant: ButtonVariant = "primary", className?: string) {
  return cn(buttonBase, buttonVariants[variant], className);
}

/** Brand card surface. */
export const card =
  "rounded-lg border border-line bg-white shadow-[0_1px_2px_rgba(23,35,52,0.05)]";

/** Gold eyebrow label used above section headings. */
export const eyebrow =
  "text-[11px] font-semibold uppercase tracking-[0.24em] text-gold";
