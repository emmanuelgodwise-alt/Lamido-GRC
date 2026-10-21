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
  gold: "bg-gold text-navy hover:bg-gold-hover",
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

/** Form field surface (inputs, selects, textareas). */
export const field =
  "w-full min-h-11 rounded-md border border-input bg-white px-3.5 py-2.5 text-sm text-ink transition-colors placeholder:text-ink/65 focus:border-navy/70 focus:outline-none focus:ring-2 focus:ring-gold/40 aria-[invalid=true]:border-destructive";

/** Form field label. */
export const fieldLabel = "block text-sm font-medium text-ink";

/** Field-level error message. */
export const fieldError = "mt-1.5 text-[13px] font-medium text-destructive";

/** Field-level hint text. */
export const fieldHint = "mt-1.5 text-xs leading-relaxed text-ink/65";
