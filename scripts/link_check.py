#!/usr/bin/env python3
"""Stage 2 link check: verify every internal link/asset in out/ resolves."""
import html.parser
import os
import re
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "out"


class LinkCollector(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in ("href", "src") and value:
                self.hrefs.append(value)


def target_exists(url: str) -> bool:
    if url.startswith(("http://", "https://", "mailto:", "tel:", "data:")):
        return True  # external / non-link — not checked here
    clean = url.split("#")[0].split("?")[0]
    if clean in ("", "/"):
        return (OUT / "index.html").exists()
    path = (OUT / clean.lstrip("/")).resolve()
    if not str(path).startswith(str(OUT.resolve())):
        return False
    if path.is_file():
        return True
    if (path / "index.html").exists():
        return True
    # Next.js default static export uses clean-URL files: /about -> about.html
    if path.suffix == "" and path.with_suffix(".html").is_file():
        return True
    return False


def main() -> int:
    pages = sorted(OUT.rglob("*.html"))
    broken = []
    checked = 0
    for page in pages:
        collector = LinkCollector()
        collector.feed(page.read_text(encoding="utf-8"))
        for href in collector.hrefs:
            checked += 1
            if not target_exists(href):
                broken.append(f"{page.relative_to(OUT)} -> {href}")
    print(f"pages: {len(pages)}, internal links/assets checked: {checked}")
    if broken:
        print("BROKEN LINKS:")
        for item in broken:
            print(" -", item)
        return 1
    print("All internal links and assets resolve. OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
