"use client";

/**
 * Persistent "Install app" affordance for header/footer.
 * Renders nothing until the browser reports install availability.
 */
import { ArrowDownToLine } from "lucide-react";
import { useInstall } from "./install-provider";
import { cn } from "@/lib/utils";

export function InstallButton({
  variant = "header",
}: {
  variant?: "header" | "footer";
}) {
  const { canInstall, promptInstall } = useInstall();
  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={() => void promptInstall()}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors",
        variant === "header"
          ? "border border-line bg-white text-navy hover:border-navy/40 hover:bg-offwhite"
          : "border border-white/25 text-white hover:bg-white/10"
      )}
    >
      <ArrowDownToLine className="h-4 w-4" aria-hidden />
      Install app
    </button>
  );
}
