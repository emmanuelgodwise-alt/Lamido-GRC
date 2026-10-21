#!/usr/bin/env python3
"""Stage 6 — extract Lighthouse results (mobile emulation) into a compact
measured-results table for the report and docs."""

import json

TARGETS = {"lcp": 2500, "cls": 0.1, "tbt": 200, "fcp": 1800, "si": 3400}

for name in ["home", "division", "contact"]:
    path = f"/home/z/my-project/tool-results/lighthouse-{name}.json"
    with open(path) as f:
        data = json.load(f)
    cats = data.get("categories", {})
    audits = data.get("audits", {})
    print(f"\n== /{'' if name == 'home' else name} (Lighthouse mobile emulation) ==")
    for cat in ["performance", "accessibility", "best-practices", "seo"]:
        score = cats.get(cat, {}).get("score")
        if score is not None:
            print(f"  {cat:14} {round(score * 100)}/100")
    for key, metric in [
        ("first-contentful-paint", "FCP"),
        ("largest-contentful-paint", "LCP"),
        ("total-blocking-time", "TBT"),
        ("cumulative-layout-shift", "CLS"),
        ("speed-index", "SI"),
    ]:
        a = audits.get(key, {})
        display = a.get("displayValue", "")
        num = a.get("numericValue")
        target = TARGETS.get(key.lower().replace("-", "").replace("speedindex", "si")
                             if key == "speed-index" else key.split("-")[0] if False else
                             {"first-contentful-paint": "fcp",
                              "largest-contentful-paint": "lcp",
                              "total-blocking-time": "tbt",
                              "cumulative-layout-shift": "cls",
                              "speed-index": "si"}[key])
        print(f"  {metric:4} {display:>12}  (target <= {target})")
    # extra detail
    for extra in ["interactive", "render-blocking-resources", "unused-javascript"]:
        a = audits.get(extra, {})
        if a.get("displayValue"):
            print(f"  {extra}: {a['displayValue']}")
