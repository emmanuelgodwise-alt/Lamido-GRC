"""Vendor Playfair Display + Inter locally (SIL OFL 1.1) for deterministic builds.

Downloads the latin-subset WOFF2 for each weight from Google Fonts and writes
them to src/fonts/, so `next build` never depends on Google's CDN.
"""

from __future__ import annotations

import re
import urllib.request
from pathlib import Path

CSS_URL = (
    "https://fonts.googleapis.com/css2"
    "?family=Playfair+Display:wght@500;600;700"
    "&family=Inter:wght@400;500;600;700"
    "&display=swap"
)
CHROME_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
OUT_DIR = Path("/home/z/my-project/src/fonts")

LICENSE_NOTE = """Playfair Display and Inter are licensed under the SIL Open Font License 1.1.
Copyright (c) Claus Sorensen (Playfair Display) and Rasmus Andersson (Inter).
https://fonts.google.com/specimen/Playfair+Display
https://fonts.google.com/specimen/Inter
Self-hosted here so builds are deterministic (no build-time CDN dependency).
"""


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    req = urllib.request.Request(CSS_URL, headers={"User-Agent": CHROME_UA})
    css = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")

    # Parse: /* <subset> */ @font-face { ... font-family: '<name>'; font-weight: <w>;
    #         ... src: url(<url>) format('woff2'); }
    blocks = re.findall(
        r"/\*\s*(?P<subset>[\w-]+)\s*\*/\s*@font-face\s*\{(?P<body>.*?)\}",
        css,
        re.S,
    )
    seen: set[tuple[str, str, str]] = set()
    for subset, body in blocks:
        if subset != "latin":
            continue
        family = re.search(r"font-family:\s*'([^']+)'", body)
        weight = re.search(r"font-weight:\s*(\d+)", body)
        url = re.search(r"src:\s*url\(([^)]+)\)", body)
        if not (family and weight and url):
            continue
        key = (family.group(1), weight.group(1), url.group(1))
        if key in seen:
            continue
        seen.add(key)

        slug = family.group(1).lower().replace(" ", "-")
        dest = OUT_DIR / f"{slug}-{weight.group(1)}.woff2"
        data = urllib.request.urlopen(
            urllib.request.Request(url.group(1), headers={"User-Agent": CHROME_UA}),
            timeout=60,
        ).read()
        dest.write_bytes(data)
        print(f"{dest.name:36s} {len(data) / 1024:7.1f} KB  (latin, wght {weight.group(1)})")

    (OUT_DIR / "LICENSE-NOTES.txt").write_text(LICENSE_NOTE, encoding="utf-8")
    print(f"\n{len(seen)} font files vendored to {OUT_DIR}")


if __name__ == "__main__":
    main()
