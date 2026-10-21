#!/usr/bin/env bash
# Stage 6 accessibility audit — runs the probe on every route at desktop and
# 320px (zoom/reflow) widths against the production build served on :4173.
# Results -> tool-results/a11y-results.jsonl (one JSON line per route/width).
set -u
BASE="http://localhost:4173"
ROUTES=(
  "/" "/about" "/services"
  "/services/regional-representation-institutional-liaison"
  "/services/market-entry-business-development"
  "/services/strategic-partnerships-investment-facilitation"
  "/services/project-trade-procurement-support"
  "/services/international-development-regional-programmes"
  "/sectors" "/how-we-work" "/contact" "/privacy" "/terms"
  "/offline" "/admin" "/nope-404-check"
)
PROBE="$(cat /home/z/my-project/tool-results/a11y_probe.js)"
OUT="/home/z/my-project/tool-results/a11y-results.jsonl"
: > "$OUT"
for W in 1280 320; do
  agent-browser set viewport "$W" 800 >/dev/null
  for R in "${ROUTES[@]}"; do
    agent-browser open "$BASE$R" >/dev/null 2>&1
    agent-browser wait --load networkidle >/dev/null 2>&1
    agent-browser wait 400 >/dev/null 2>&1
    RES="$(agent-browser eval "$PROBE" 2>/dev/null)"
    echo "{\"width\":$W,\"data\":$RES}" >> "$OUT"
  done
done
echo "AUDIT-DONE"
