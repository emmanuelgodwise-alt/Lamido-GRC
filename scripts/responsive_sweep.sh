#!/usr/bin/env bash
# Stage 7 responsive sweep — the doc's exact five sizes (360x800, 390x844,
# 768x1024, 1280x800, 1440x900) across the key routes, using the Stage 6
# accessibility probe (horizontal overflow, small touch targets, heading
# order, landmarks, labels). Results -> tool-results/sweep-results.jsonl.
set -u
BASE="http://localhost:4173"
ROUTES=(
  "/" "/services"
  "/services/market-entry-business-development"
  "/contact" "/admin" "/privacy" "/nope-404"
)
SIZES=("360 800" "390 844" "768 1024" "1280 800" "1440 900")
PROBE="$(cat /home/z/my-project/tool-results/a11y_probe.js)"
OUT="/home/z/my-project/tool-results/sweep-results.jsonl"
: > "$OUT"
for SIZE in "${SIZES[@]}"; do
  set -- $SIZE
  agent-browser set viewport "$1" "$2" >/dev/null
  for R in "${ROUTES[@]}"; do
    agent-browser open "$BASE$R" >/dev/null 2>&1
    agent-browser wait --load networkidle >/dev/null 2>&1
    agent-browser wait 300 >/dev/null 2>&1
    RES="$(agent-browser eval "$PROBE" 2>/dev/null)"
    echo "{\"w\":\"$1\",\"data\":$RES}" >> "$OUT"
  done
done
echo "SWEEP-DONE"
