"use client";

/**
 * Sticky site header with:
 * - Desktop navigation with active-state indication
 * - Accessible mobile menu (Escape, outside click, focus return, focus trap,
 *   scroll lock, aria-expanded/controls)
 * - Persistent "Install app" affordance and the consultation CTA
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks } from "@/lib/site";
import { btn } from "@/lib/styles";
import { LogoLockup } from "@/components/brand/logo";
import { InstallButton } from "@/components/pwa/install-button";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Menu behaviors: focus first link, Escape, outside click, focus trap, scroll lock.
  // (The menu also closes on navigation via each link's onClick.)
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const toggle = buttonRef.current;
    if (!panel) return;

    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
      );

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panel.contains(target) && !buttonRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <LogoLockup />

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center border-b-2 px-3 text-sm font-medium transition-colors",
                      active
                        ? "border-gold text-navy"
                        : "border-transparent text-ink/70 hover:border-gold/60 hover:text-navy"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Header install button hidden on phones: the first-visit banner,
              the footer button, and the mobile-menu button already cover
              small screens (prevents header overflow at 360-390px). */}
          <span className="max-sm:hidden">
            <InstallButton variant="header" />
          </span>
          <Link
            href="/contact"
            className={btn("primary", "max-sm:hidden sm:min-h-10 sm:px-4 sm:py-2")}
          >
            Request a Consultation
          </Link>

          {/* Mobile menu toggle */}
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line text-navy transition-colors hover:bg-offwhite lg:hidden"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div
          id="site-mobile-menu"
          ref={panelRef}
          role="region"
          aria-label="Site navigation"
          className="border-t border-line bg-white shadow-lg lg:hidden"
        >
          <nav aria-label="Mobile" className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
            <ul>
              {navLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center rounded-md px-3 text-[15px] font-medium transition-colors",
                        active
                          ? "bg-offwhite text-navy"
                          : "text-ink/75 hover:bg-offwhite hover:text-navy"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex flex-col gap-2.5 border-t border-line pt-4">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className={btn("primary", "w-full")}
              >
                Request a Consultation
              </Link>
              <InstallButton variant="header" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
