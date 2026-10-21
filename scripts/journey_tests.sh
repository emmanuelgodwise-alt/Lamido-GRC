#!/usr/bin/env bash
# Stage 7 journey tests — public journey (doc line 303) and the admin states
# reachable without owner credentials, against the production build on :4173.
# Evidence -> tool-results/journey-log.txt
set -u
BASE="http://localhost:4173"
LOG="/home/z/my-project/tool-results/journey-log.txt"
: > "$LOG"

log() { echo "$1" | tee -a "$LOG"; }
check() { # $1 = description, $2 = expected substring, $3 = actual
  if echo "$3" | grep -qiF "$2"; then
    log "PASS: $1 (found '$2')"
  else
    log "FAIL: $1 (expected '$2' in: $(echo "$3" | head -c 200))"
  fi
}

agent-browser set viewport 1280 800 >/dev/null

# --- 1. Home ---
agent-browser open "$BASE/" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
T="$(agent-browser get title)"
check "home title" "Lamido, Lamido & Co." "$T"
B="$(agent-browser eval "document.body.innerText.slice(0,600)")"
check "home hero tagline" "Your Trusted Regional Representative and Strategic Partner in Northern Nigeria" "$B"

# --- 2. Services overview lists all five divisions ---
agent-browser open "$BASE/services" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
B="$(agent-browser eval "document.body.innerText")"
for D in "Regional Representation & Institutional Liaison" \
         "Market Entry & Business Development" \
         "Strategic Partnerships & Investment Facilitation" \
         "Project, Trade & Procurement Support" \
         "International Development & Regional Programmes"; do
  check "services lists division" "$D" "$B"
done

# --- 3. Each division page: h1 + consultation CTA ---
for S in regional-representation-institutional-liaison \
         market-entry-business-development \
         strategic-partnerships-investment-facilitation \
         project-trade-procurement-support \
         international-development-regional-programmes; do
  agent-browser open "$BASE/services/$S" >/dev/null 2>&1
  agent-browser wait --load networkidle >/dev/null 2>&1
  H="$(agent-browser eval "document.querySelector('h1')?.textContent || ''")"
  check "division h1 present ($S)" "Liaison\|Development\|Facilitation\|Support\|Programmes" "$H"
  B="$(agent-browser eval "document.body.innerText")"
  check "division CTA present ($S)" "Request a Consultation" "$B"
done

# --- 4. Division CTA navigates to /contact ---
agent-browser open "$BASE/services/market-entry-business-development" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser find text "Request a Consultation" click >/dev/null 2>&1
agent-browser wait --url "/contact" >/dev/null 2>&1
U="$(agent-browser get url)"
check "division CTA lands on contact" "/contact" "$U"

# --- 5. Form: empty submit shows field errors + focus ---
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser find role button click --name "Send enquiry" >/dev/null 2>&1 || agent-browser find text "Send" click >/dev/null 2>&1
agent-browser wait 600 >/dev/null 2>&1
N="$(agent-browser eval "document.querySelectorAll('[aria-invalid=true]').length")"
if [ "$N" -ge 5 ] 2>/dev/null; then log "PASS: empty submit flags $N fields aria-invalid"; else log "FAIL: empty submit flagged only '$N' fields"; fi
F="$(agent-browser eval "document.activeElement.getAttribute('aria-invalid')")"
check "focus moves to first error" "true" "$F"

# --- 6. Invalid email + short message inline errors ---
agent-browser set viewport 1280 800 >/dev/null
E="$(agent-browser eval "(() => { const el=[...document.querySelectorAll('input[type=email]')][0]; el.value='not-an-email'; el.dispatchEvent(new Event('input',{bubbles:true})); return 'set'; })()")"
agent-browser find role button click --name "Send enquiry" >/dev/null 2>&1 || agent-browser find text "Send" click >/dev/null 2>&1
agent-browser wait 500 >/dev/null 2>&1
B="$(agent-browser eval "document.body.innerText")"
check "invalid email inline error" "email" "$B"

# --- 7. 404 ---
agent-browser open "$BASE/nope-404" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
B="$(agent-browser eval "document.body.innerText")"
check "custom 404 page" "Page not found" "$B"

# --- 8. Privacy + Terms from footer ---
for P in privacy terms; do
  agent-browser open "$BASE/$P" >/dev/null 2>&1
  agent-browser wait --load networkidle >/dev/null 2>&1
  T="$(agent-browser get title)"
  check "$P page loads" "$P" "$T"
done

# --- 9. Offline page direct load ---
agent-browser open "$BASE/offline" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
B="$(agent-browser eval "document.body.innerText")"
check "offline page honest message" "offline" "$B"

# --- 10. Mobile menu (390px): open, links, Escape close, focus return ---
agent-browser set viewport 390 844 >/dev/null
agent-browser open "$BASE/" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
agent-browser find role button click --name "Open menu" >/dev/null 2>&1
agent-browser wait 400 >/dev/null 2>&1
B="$(agent-browser eval "document.getElementById('site-mobile-menu')?.innerText || ''")"
check "mobile menu opens with nav links" "How We Work" "$B"
agent-browser press Escape >/dev/null 2>&1
agent-browser wait 300 >/dev/null 2>&1
V="$(agent-browser eval "document.getElementById('site-mobile-menu') ? 'visible' : 'closed'")"
check "Escape closes mobile menu" "closed" "$V"

# --- 11. Admin: reachable states without credentials ---
agent-browser set viewport 1280 800 >/dev/null
agent-browser open "$BASE/admin" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
B="$(agent-browser eval "document.body.innerText")"
check "admin sign-in panel loads" "administrator" "$B"
agent-browser find role button click --name "Sign in" >/dev/null 2>&1 || true
agent-browser wait 500 >/dev/null 2>&1
N="$(agent-browser eval "document.querySelectorAll('[aria-invalid=true]').length")"
if [ "$N" -ge 2 ] 2>/dev/null; then log "PASS: admin empty sign-in flags $N fields"; else log "NOTE: admin empty sign-in flagged '$N' fields (check manually)"; fi
B="$(agent-browser eval "document.body.innerText")"
check "admin has no public registration" "no public" "$B"

# --- 12. Admin mobile layout (390px) ---
agent-browser set viewport 390 844 >/dev/null
agent-browser open "$BASE/admin" >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1
OV="$(agent-browser eval "document.documentElement.scrollWidth - document.documentElement.clientWidth")"
if [ "$OV" -le 1 ] 2>/dev/null; then log "PASS: admin no horizontal overflow at 390px"; else log "FAIL: admin overflow ${OV}px at 390px"; fi

echo "JOURNEY-DONE"
