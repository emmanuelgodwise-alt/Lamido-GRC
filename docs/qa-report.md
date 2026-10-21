# QA Report — Release-Candidate Audit (Stage 7)

**Date: 21 October 2026.** Scope per the dev-prompt document: end-to-end QA,
security review, regression testing, and content polish — no new product
scope. Environment: production static build (`bun run build`) served locally
(gzip enabled), Chromium via automation, Lighthouse 13 mobile emulation.

Sections separate **tested** (evidence below), **not tested** (with reason),
and **requires owner credentials/device**.

## 1. Automated checks — all passing

| Check | Command | Result |
| --- | --- | --- |
| Lint | `bun run lint` | 0 errors, 0 warnings |
| Typecheck | `bun run typecheck` | clean |
| Unit tests | `bun test` | **61/61** (brand + manifest + enquiry + admin + PWA hygiene + URL resolver) |
| Production build | `bun run build` | 20 static routes exported |
| Route/link check | `scripts/link_check.py` | 818 internal links/assets across 17 built pages — all resolve |
| Accessibility probe | `scripts/a11y_audit.sh` | 16 routes × {1280, 320} px — **0 findings** (headings, landmarks, labels, names, targets, overflow) |
| Responsive sweep | `scripts/responsive_sweep.sh` | 7 key routes × **360×800, 390×844, 768×1024, 1280×800, 1440×900** — **0 findings** (35 combinations) |
| Contrast | `scripts/contrast_audit.py` | 27/27 real text/surface pairs ≥ WCAG AA |
| Performance | Lighthouse, 3 pages | Perf 93–94, A11y 100, BP 100, SEO 100, CLS 0 (details in docs/pwa-verification.md) |
| Console hygiene | browser automation | 0 errors / 0 warnings on dev and production-served builds |

**E2e framework:** none is configured — deliberate for this release. The app
is a static export with no server runtime; behaviour is covered by 61 unit
tests plus the scripted browser journeys below. If the owner later wants a
formal e2e suite (e.g. Playwright), it can be added against the live URL
after Supabase is connected.

## 2. Public journey — tested (all pass)

Home (exact title + tagline) → Services overview (all **five divisions**
listed with exact names) → each of the five division pages (h1 + "Request a
Consultation" CTA) → CTA lands on `/contact`.

- **Empty form submit:** 8 fields flagged `aria-invalid` with per-field
  messages ("Please enter your full name…", etc.); focus moves to the first
  invalid field.
- **Invalid email:** inline "Please enter a valid work email address."
  linked via `aria-describedby`.
- **Valid submit (configured-path build):** honest failure banner ("A network
  problem prevented the submission… your input has been kept") with all input
  retained — no fake success, no duplicate submits.
- **Valid submit (unconfigured build = current production):** the form is
  replaced by the honest not-configured panel — "No information entered on
  this page is sent or stored."
- **404** (`/nope-404`): custom Page-not-found page.
- **Privacy / Terms:** both load from the footer.
- **Offline page:** direct load shows the honest offline state.
- **Mobile menu (390×844):** opens with all nav links, Escape closes it.
- **Install banner / update toast:** render by design; the fixed banner
  reserves page-bottom space so content scrolls clear (verified Stage 5/6).

## 3. Admin journey — split by feasibility

**Tested (no credentials needed):** `/admin` loads (noindex, excluded from
sitemap/robots/SW); sign-in panel renders; honest "Administration area
unavailable — the secure enquiry system is not yet connected" state in the
unconfigured build; "no public registration" is stated on the page; no
horizontal overflow at 390 px; the recovery link carries a 44 px target and
guards an empty email with an inline message (unit-tested).

**Requires owner Supabase project (listed in docs/admin-onboarding.md and
docs/enquiry-live-test.md):** real sign-in, invalid sign-in, logout, expired
session, authorization denial (non-admin), dashboard loading/empty/error
states, search, filters, pagination, status changes, internal notes, CSV
export, mobile table→card layouts. The underlying logic (CSV formula-safety,
status metadata, notes limits, session-expiry state clearing) is covered by
16 unit tests; the live journeys remain owner-verified per the brief
("Do not consider an enquiry form production-ready until a real end-to-end
test succeeds").

## 4. Security review (doc checklist, item by item)

| Requirement | Status | Evidence |
| --- | --- | --- |
| RLS on every exposed table | Pass | `supabase/migrations/20261021000002_admin_rls.sql` — default-deny on all tables; owner runs `supabase/verify-rls.sql` live |
| No service-role key in source or bundle | Pass | `git grep service_role -- src/` → none; build scan for `eyJ…` JWTs and project URLs → none baked |
| No default admin credentials | Pass | No credentials anywhere in code; first-admin bootstrap is an owner step (docs/supabase-setup.md) |
| No public signup | Pass | No sign-up route; admin page states manual provisioning; assertion in tests |
| No anonymous enquiry read/list/update/delete | Pass | RLS has no anon policies; enquiries are written only by the Edge Function (service key server-side) |
| Function validation | Pass | Shared rulebook runs in browser + Edge Function + tests (22 enquiry tests) |
| CORS / origin | Pass | Edge Function origin allow-list; 403 → honest origin-blocked UI state |
| Input limits | Pass | Field lengths enforced client, server (Edge Function caps), and DB CHECK constraints |
| Errors disclose no stacks/secrets | Pass | Edge Function returns safe non-sensitive messages; no payload logging |
| CSV formula injection | Pass | Tests cover `= + - @` tab/CR neutralization + RFC 4180 quoting |
| No sensitive caching | Pass | SW never caches `/admin`, `/api`, `/auth`, cross-origin; source-guarded by tests |
| No fake production claims | Pass | Copy scans (below) — no testimonials/client lists/statistics anywhere |

**Secret scan:** tracked-tree scan for token/key patterns
(`ghp_…`, `gho_…`, `github_pat_…`, `sk-…`, `eyJhbGci…`, `AKIA…`, private-key
blocks) — **no matches**. The two GitHub PATs the owner pasted into chat were
never present in any commit (verified via history scan); both must remain
**revoked** — a pasted token is compromised regardless of commit history.

## 5. Content review

- Company spelling "Lamido, Lamido & Co." — exact everywhere; the forbidden
  "Lanmido" spelling appears nowhere (grep + brand tests).
- Five divisions with exact names/numbering/order — guarded by tests.
- No lorem/placeholder/TBD text in built pages; no testimonials, client
  lists, "trusted by", case studies, or statistics language (greps clean).
- Privacy Notice reflects the Stage 4 data handling (hashed IP anti-spam,
  no email-notification promise); Terms carries owner/legal review notes.
- No analytics/tracking of any kind is enabled (scan for gtag/GTM/fbq/
  mixpanel/hotjar/plausible — the sole grep hit is the English word
  "plausible" in a code comment). Nothing nonessential is stored client-side.
- Owner TODOs in code are exactly two deliberate, documented items in
  `src/lib/site.ts` (production domain, official contact email) — both
  listed for the launch checklist.

## 6. Findings and remediation (this audit)

1. **FIXED — localhost URLs baked into deployed builds (high).** With
   `NEXT_PUBLIC_SITE_URL` unset, canonical tags, OG URLs, sitemap, robots,
   and JSON-LD in the **live** deployment pointed at `http://localhost:3000`.
   Remediation: `resolveSiteUrl()` now prefers the owner domain, then
   Vercel's auto-provided production/deployment URLs; localhost remains only
   the local-dev fallback. A simulated-Vercel build was verified clean
   (canonicals, `<loc>` entries, OG, JSON-LD all use the deployment URL;
   the only remaining "localhost:3000" in the bundle is the resolver's own
   fallback string in code). Unit-tested (5 new tests). **The live site
   keeps its stale URLs until the owner pushes/authorizes this stage.**
2. **FIXED — stray local `.env` masking honest states (medium).** A local
   (gitignored, never committed) `.env` with dummy Supabase values — created
   by Stage 4 QA to exercise configured-path UI — had leaked into later QA
   runs, hiding the not-configured states a real visitor sees. Removed; both
   states re-verified; the QA procedure is documented here: to exercise the
   configured path locally, create a temporary `.env` with dummy values and
   delete it after (it is and must stay gitignored).
3. **Noted — journey-script artifacts (low, tooling).** Three false "fails"
   during journey automation were script bugs (fixed-string grep with
   alternation; coordinate clicks intercepted by the fixed install banner at
   the button's scroll position; expectation mismatch on admin banner-vs-
   field errors). Programmatic verification confirmed the product behaviour
   is correct in each case.

## 7. Responsive outcomes (independent, per the brief's rule)

- **Mobile (360/390):** 0 horizontal overflow, 0 tiny targets, no clipped
  dialogs, readable cards, safe-area-aware fixed banners — across all routes.
- **Desktop (1280/1440):** 0 overflow, balanced grids, no whitespace issues.
- **Tablet (768):** 0 findings. Both device classes pass independently.

## 8. Not tested / owner-required before launch

- Live enquiry form → database → admin dashboard end-to-end (needs the
  Supabase project, Edge Function deployment, first admin —
  docs/supabase-setup.md, docs/enquiry-live-test.md).
- Real-device PWA installs (Android Chrome, iOS Safari) — docs/pwa-verification.md.
- Live-URL Lighthouse re-measurement + real-user Core Web Vitals.
- Optional Turnstile anti-bot (feature-flagged, off by default) and email
  notifications (explicitly not promised; not implemented).
- Vercel Hobby terms: the live commercial site must move to a
  commercial-permitting plan or Cloudflare Pages before public launch
  (docs/deployment.md).

## 9. Known risks / limits

- Supabase Free pauses inactive projects (~1 week) — restorable; documented.
- The admin dashboard's live security boundary is RLS (fail-closed); UI
  states are UX only — owner must run the RLS verification checklist once
  the project exists.
- Lighthouse numbers are simulated (throttled mid-tier mobile on a local
  static server); they are measurements, not live field data.
