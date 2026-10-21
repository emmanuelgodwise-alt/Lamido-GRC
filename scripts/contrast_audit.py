#!/usr/bin/env python3
"""Stage 6 contrast audit — verification record after fixes.

Computes WCAG 2.1 contrast ratios for every real text/surface pair in the
final palette (alpha-aware). Decorative, aria-hidden, or disabled-state uses
(gold accent icons, watermark numerals, disabled pagination, footer
separator) are WCAG-exempt and not listed as required pairs."""

def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def blend(fg, bg, a):
    f, b = hex_rgb(fg), hex_rgb(bg)
    return tuple(round(a * f[i] + (1 - a) * b[i]) for i in range(3))

def lum(rgb):
    def chan(c):
        c = c / 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * chan(rgb[0]) + 0.7152 * chan(rgb[1]) + 0.0722 * chan(rgb[2])

def ratio(fg, bg, a=1.0):
    f, b = lum(blend(fg, bg, a)), lum(hex_rgb(bg))
    hi, lo = max(f, b), min(f, b)
    return (hi + 0.05) / (lo + 0.05)

NAVY, NAVY_DEEP = "#0b2e59", "#08203f"
GOLD, GOLD_INK, GOLD_HOVER = "#c99a35", "#8a6714", "#c19132"
INK, OFFWHITE, WHITE = "#172334", "#f7f6f2", "#ffffff"
GOLD_TINT = "#%02x%02x%02x" % blend(GOLD, WHITE, 0.14)  # in_review chip bg

PAIRS = [
    ("ink body on white", INK, WHITE, 1, 4.5),
    ("ink body on offwhite", INK, OFFWHITE, 1, 4.5),
    ("ink/85 on white", INK, WHITE, 0.85, 4.5),
    ("ink/80 on white", INK, WHITE, 0.80, 4.5),
    ("ink/75 on white", INK, WHITE, 0.75, 4.5),
    ("ink/70 on white", INK, WHITE, 0.70, 4.5),
    ("ink/70 on offwhite", INK, OFFWHITE, 0.70, 4.5),
    ("ink/65 (hints, fine print) on white", INK, WHITE, 0.65, 4.5),
    ("ink/65 placeholder on white", INK, WHITE, 0.65, 4.5),
    ("navy on white", NAVY, WHITE, 1, 4.5),
    ("navy on offwhite", NAVY, OFFWHITE, 1, 4.5),
    ("gold-ink eyebrow on white", GOLD_INK, WHITE, 1, 4.5),
    ("gold-ink eyebrow on offwhite", GOLD_INK, OFFWHITE, 1, 4.5),
    ("gold-ink 404 numeral (large) on white", GOLD_INK, WHITE, 1, 3.0),
    ("navy on gold (primary gold button)", NAVY, GOLD, 1, 4.5),
    ("navy on gold-hover (button hover)", NAVY, GOLD_HOVER, 1, 4.5),
    ("white on navy (primary button, footer)", WHITE, NAVY, 1, 4.5),
    ("white on navy-deep (hover)", WHITE, NAVY_DEEP, 1, 4.5),
    ("white/75 on navy", WHITE, NAVY, 0.75, 4.5),
    ("white/70 on navy", WHITE, NAVY, 0.70, 4.5),
    ("white/65 on navy", WHITE, NAVY, 0.65, 4.5),
    ("white/60 on navy (banner dismiss)", WHITE, NAVY, 0.60, 4.5),
    ("white/55 on navy (footer headings)", WHITE, NAVY, 0.55, 4.5),
    ("gold on navy (dark-section eyebrow)", GOLD, NAVY, 1, 4.5),
    ("gold on navy-deep", GOLD, NAVY_DEEP, 1, 4.5),
    ("gold-ink on in_review chip tint", GOLD_INK, GOLD_TINT, 1, 4.5),
    ("ink/65 on in_review-adjacent offwhite", INK, OFFWHITE, 0.65, 4.5),
]

print(f"{'pair':46} {'ratio':>6}  req   verdict")
print("-" * 72)
fails = []
for label, fg, bg, a, req in PAIRS:
    r = ratio(fg, bg, a)
    ok = r >= req
    if not ok:
        fails.append((label, r, req))
    print(f"{label:46} {r:6.2f}  {req:3.1f}  {'PASS' if ok else 'FAIL'}")

print(f"\nFAILURES: {len(fails)}")
for label, r, req in fails:
    print(f"  - {label}: {r:.2f} < {req}")
print("\nExempt (not listed above): aria-hidden decorative icons/numerals, "
      "disabled pagination buttons (inactive UI), footer /25 separator.")
