#!/usr/bin/env python3
"""Stage 6 a11y audit aggregator: parses a11y-results.jsonl (agent-browser
eval output is double-encoded) and prints grouped findings."""
import json

issues = {}
headings = {}
total = 0
for line in open("/home/z/my-project/tool-results/a11y-results.jsonl"):
    line = line.strip()
    if not line:
        continue
    try:
        rec = json.loads(line)
    except Exception:
        print("PARSE-FAIL:", line[:120])
        continue
    d = rec.get("data")
    if isinstance(d, str):
        try:
            d = json.loads(d)
        except Exception:
            print("INNER-PARSE-FAIL:", str(d)[:120])
            continue
    if not isinstance(d, dict):
        print("EMPTY at width", rec.get("width"))
        continue
    route, w = d.get("route"), rec.get("width")
    headings[(route, w)] = d.get("h", "")
    if d.get("c"):
        issues.setdefault((route, w), []).extend(d["c"])
        total += len(d["c"])

print("TOTAL issues:", total)
for (route, w), v in sorted(issues.items()):
    print(f"\n== {route} @{w}px ==")
    for i in v:
        print("  -", i)

if not issues:
    print("\nNo issues found on any route at either width.")
