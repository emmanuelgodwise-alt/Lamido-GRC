"""Stage 1 brand asset preparation for Lamido, Lamido & Co.

Reads the owner-supplied official logo (never modified) and produces:

Repo archive:
- assets/brand/global-emblem-original.png   (archived source, committed)

Public web assets:
- public/brand/logo-footer.png          (web wordmark, 2x footer display — JSON-LD logo)
- public/brand/emblem-header.png        (web emblem, 2x header display)
- public/brand/emblem-home.png          (web emblem, 2x hero display)
- public/brand/og-image.png             (1200x630 social preview card)

The full-resolution knockout/crop intermediates are derived in memory only;
the archived source logo (assets/brand/) can always regenerate everything.
- public/icons/icon-192.png / icon-512.png  (regular PWA icons, white background)
- public/icons/icon-192-maskable.png /
  public/icons/icon-512-maskable.png        (maskable PWA icons, safe zone)
- public/apple-touch-icon.png               (180x180)
- public/favicon.ico                        (16/32/48 multi-size)

Usage: python3 scripts/prepare_brand_assets.py
"""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/home/z/my-project")
SRC_CANDIDATES = [
    ROOT / "assets" / "brand" / "global-emblem-original.png",
    ROOT / "upload" / "Lamido, Lamido & Co. Global Emblem.png",
]
ARCHIVE = ROOT / "assets" / "brand" / "global-emblem-original.png"
BRAND = ROOT / "public" / "brand"
ICONS = ROOT / "public" / "icons"

NAVY = (11, 46, 89)          # #0B2E59
GOLD = (201, 154, 53)        # #C99A35
OFFWHITE = (247, 246, 242)   # #F7F6F2
WHITE = (255, 255, 255)
INK = (23, 35, 52)           # #172334

BG_THRESHOLD = 242   # pixels with ALL channels >= this are background candidates
CROP_GAP_ROWS = 10   # a blank run of this many rows separates emblem from wordmark

SERIF_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SANS_BOLD = "/usr/share/fonts/truetype/english/Carlito-Bold.ttf"
SANS_REGULAR = "/usr/share/fonts/truetype/english/Carlito-Regular.ttf"


def flood_background_mask(img: Image.Image) -> Image.Image:
    """L-mode mask: 255 = white background connected to the image border."""
    w, h = img.size
    rgb = img.convert("RGB")
    px = rgb.load()
    mask = Image.new("L", (w, h), 0)
    mpx = mask.load()
    stack: list[tuple[int, int]] = []
    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        if mpx[x, y]:
            continue
        r, g, b = px[x, y]
        if r < BG_THRESHOLD or g < BG_THRESHOLD or b < BG_THRESHOLD:
            continue
        mpx[x, y] = 255
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return mask


def knockout_white(original: Image.Image) -> Image.Image:
    """Return RGBA copy with the border-connected white background removed.

    A 1px alpha erosion removes the anti-aliased white fringe.
    """
    mask = flood_background_mask(original)
    alpha = mask.point(lambda v: 0 if v == 255 else 255)
    alpha = alpha.filter(ImageFilter.MinFilter(3))
    rgba = original.convert("RGBA")
    rgba.putalpha(alpha)
    return rgba


def trim_alpha(rgba: Image.Image, pad: int = 0) -> Image.Image:
    bbox = rgba.getchannel("A").getbbox()
    if not bbox:
        raise SystemExit("error: no visible content found")
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(rgba.width, x1 + 1 + pad)
    y1 = min(rgba.height, y1 + 1 + pad)
    return rgba.crop((x0, y0, x1, y1))


def crop_emblem(full_rgba: Image.Image) -> Image.Image:
    """Crop the symbol block (LL monogram + globe + ribbon) above the wordmark."""
    alpha = full_rgba.getchannel("A")
    w, h = alpha.size
    content_rows = [y for y in range(h) if alpha.crop((0, y, w, y + 1)).getbbox()]
    if not content_rows:
        raise SystemExit("error: no content rows found")
    top = content_rows[0]
    emblem_bottom = content_rows[-1]
    prev = top
    for y in content_rows:
        if y - prev > CROP_GAP_ROWS:
            emblem_bottom = prev
            break
        prev = y
    band = alpha.crop((0, top, w, emblem_bottom + 1))
    bbox = band.getbbox()
    if not bbox:
        raise SystemExit("error: emblem band empty")
    x0, _, x1, _ = bbox
    return full_rgba.crop((x0, top, x1 + 1, emblem_bottom + 1))


def compose_icon(emblem: Image.Image, size: int, ratio: float, bg=WHITE) -> Image.Image:
    canvas = Image.new("RGB", (size, size), bg)
    ew, eh = emblem.size
    target = int(size * ratio)
    scale = min(target / ew, target / eh)
    nw, nh = max(1, round(ew * scale)), max(1, round(eh * scale))
    em = emblem.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(em, ((size - nw) // 2, (size - nh) // 2), em)
    return canvas


def draw_tracked(
    draw: ImageDraw.ImageDraw, xy, text: str, font: ImageFont.FreeTypeFont,
    fill, tracking: int = 0, anchor_mid_x: int | None = None,
) -> None:
    """Draw text; optionally letterspaced and horizontally centered."""
    if anchor_mid_x is None:
        draw.text(xy, text, font=font, fill=fill)
        return
    widths = [font.getlength(ch) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = anchor_mid_x - total / 2
    y = xy[1]
    for ch, wch in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=fill)
        x += wch + tracking


def make_og_image(emblem: Image.Image) -> Image.Image:
    W, H = 1200, 630
    canvas = Image.new("RGB", (W, H), NAVY)
    draw = ImageDraw.Draw(canvas)

    # Subtle gold keyline frame
    draw.rectangle((24, 24, W - 24, H - 24), outline=(201, 154, 53), width=2)

    # Off-white circular plate with the emblem
    plate_d = 216
    cx, cy = W // 2, 172
    draw.ellipse(
        (cx - plate_d // 2, cy - plate_d // 2, cx + plate_d // 2, cy + plate_d // 2),
        fill=OFFWHITE,
    )
    target = int(plate_d * 0.74)
    ew, eh = emblem.size
    scale = min(target / ew, target / eh)
    nw, nh = round(ew * scale), round(eh * scale)
    em = emblem.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(em, (cx - nw // 2, cy - nh // 2), em)

    name_font = ImageFont.truetype(SERIF_BOLD, 72)
    desc_font = ImageFont.truetype(SANS_BOLD, 27)
    tag_font = ImageFont.truetype(SANS_REGULAR, 26)

    draw.text((W // 2, 348), "Lamido, Lamido & Co.", font=name_font, fill=WHITE, anchor="mm")
    draw_tracked(draw, (0, 412), "GLOBAL RESOURCE COMPANY", desc_font, GOLD, tracking=7, anchor_mid_x=W // 2)

    # Short gold rule
    draw.line((W // 2 - 42, 458, W // 2 + 42, 458), fill=GOLD, width=2)

    tagline = "Your Trusted Regional Representative and Strategic Partner in Northern Nigeria."
    # Wrap tagline to at most two balanced lines
    words = tagline.split()
    best_line1 = " ".join(words[: len(words) // 2])
    best_line2 = " ".join(words[len(words) // 2 :])
    draw.text((W // 2, 500), best_line1, font=tag_font, fill=(222, 226, 233), anchor="mm")
    draw.text((W // 2, 542), best_line2, font=tag_font, fill=(222, 226, 233), anchor="mm")
    return canvas


def alpha_coverage(rgba: Image.Image) -> float:
    hist = rgba.getchannel("A").histogram()
    total = sum(hist)
    opaque = sum(hist[128:])
    return 100.0 * opaque / total


def save_web_png(img: Image.Image, path: Path) -> None:
    """Right-sized web PNG for flat brand art: 256-color quantization
    (alpha-preserving) + optimize — a fraction of the raw RGBA size."""
    quantized = img.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE)
    quantized.save(path, optimize=True)


def main() -> None:
    src = next((p for p in SRC_CANDIDATES if p.exists()), None)
    if src is None:
        raise SystemExit("error: source logo not found")
    original = Image.open(src)
    print(f"source: {src} ({original.format}, {original.size})")

    for d in (BRAND, ICONS, ARCHIVE.parent):
        d.mkdir(parents=True, exist_ok=True)

    # Archive the untouched source inside the repo
    if src != ARCHIVE:
        shutil.copy2(src, ARCHIVE)
        print(f"archived source -> {ARCHIVE}")

    # Transparent full logo (in-memory source for the footer wordmark;
    # the oversized full-resolution export no longer ships — the UI uses
    # right-sized web variants below).
    full_rgba = knockout_white(original)
    full_trimmed = trim_alpha(full_rgba, pad=4)
    print(f"full logo transparent: {full_trimmed.size}, visible area {alpha_coverage(full_trimmed):.1f}%")

    # Web-optimized wordmark for the footer (2x its 160px display width).
    logo_footer = full_trimmed.resize((320, round(full_trimmed.height * 320 / full_trimmed.width)), Image.LANCZOS)
    save_web_png(logo_footer, BRAND / "logo-footer.png")
    print(f"footer wordmark (optimized): {logo_footer.size}")

    # Emblem symbol crop (in-memory source for icons and web variants)
    emblem = crop_emblem(full_rgba)
    emblem_pad = trim_alpha(emblem, pad=6)
    print(f"emblem crop transparent: {emblem_pad.size}, visible area {alpha_coverage(emblem_pad):.1f}%")

    # Web-optimized emblem variants (2x their display sizes):
    # header lockup renders at 36-40px tall; the home hero emblem at ~310px.
    emblem_header = emblem_pad.resize((round(emblem_pad.width * 80 / emblem_pad.height), 80), Image.LANCZOS)
    save_web_png(emblem_header, BRAND / "emblem-header.png")
    print(f"header emblem (optimized): {emblem_header.size}")
    emblem_home = emblem_pad.resize((620, round(emblem_pad.height * 620 / emblem_pad.width)), Image.LANCZOS)
    save_web_png(emblem_home, BRAND / "emblem-home.png")
    print(f"home emblem (optimized): {emblem_home.size}")

    # PWA icons
    compose_icon(emblem_pad, 192, 0.68).save(ICONS / "icon-192.png")
    compose_icon(emblem_pad, 512, 0.70).save(ICONS / "icon-512.png")
    compose_icon(emblem_pad, 192, 0.52).save(ICONS / "icon-192-maskable.png")
    compose_icon(emblem_pad, 512, 0.54).save(ICONS / "icon-512-maskable.png")
    compose_icon(emblem_pad, 180, 0.62).save(ROOT / "public" / "apple-touch-icon.png")
    favicon_base = compose_icon(emblem_pad, 64, 0.92)
    favicon_base.save(
        ROOT / "public" / "favicon.ico",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )

    # Social preview card
    og = make_og_image(emblem_pad)
    og.save(BRAND / "og-image.png", quality=95)

    print("\nGenerated public assets:")
    for p in sorted(BRAND.glob("*.png")) + sorted(ICONS.glob("*.png")) + [
        ROOT / "public" / "apple-touch-icon.png",
        ROOT / "public" / "favicon.ico",
    ]:
        with Image.open(p) as im:
            print(f"  {p.relative_to(ROOT)}  {im.size} {im.mode}")


if __name__ == "__main__":
    main()
