# Handover Report — Lamido, Lamido & Co. PWA

**Prepared: 21 October 2026 (Stage 8).** A concise map of the project for the
owner and any future developer. Detailed evidence lives in the linked docs.

## Architecture

- **Next.js 16 (App Router) + TypeScript, static export** (`output: "export"`
  → `out/`, 20 prerendered routes). No API routes, no middleware, no SSR —
  the public site is pure static HTML/CSS/JS, hostable on any static host.
- **Design system**: Tailwind CSS 4 tokens (navy `#0B2E59`, gold `#C99A35`,
  ink, off-white) with bespoke components over native elements
  (`src/lib/styles.ts` primitives; the unused shadcn scaffold was removed in
  Stage 8). Playfair Display + Inter ship as **two variable WOFF2 files**
  (self-hosted, OFL).
- **PWA**: static manifest (`src/app/manifest.ts`), hand-written versioned
  service worker (`public/sw.js`, `llc-v2`) — cache-first immutable assets,
  network-first pages, **never** caches `/admin`, `/api`, `/auth`, or
  cross-origin traffic. Install banner (7-day dismissal memory, one-time iOS
  guidance) and an update-available toast that only refreshes on the user's
  explicit click. SW registers **in production only**.
- **Backend**: Supabase (Postgres + Auth + Edge Functions), browser-side the
  client holds only the project URL + anon key; the service-role key exists
  solely inside the `create-enquiry` Edge Function's secrets.

## Routes (all static)

`/` home · `/about` · `/services` + five division pages
(`/services/regional-representation-institutional-liaison`,
`market-entry-business-development`,
`strategic-partnerships-investment-facilitation`,
`project-trade-procurement-support`,
`international-development-regional-programmes`) · `/sectors` ·
`/how-we-work` · `/contact` (enquiry form) · `/privacy` · `/terms` ·
`/offline` · custom 404 · `/admin` (client-side dashboard, noindex).

## The five divisions (exact, order 01–05)

Regional Representation & Institutional Liaison · Market Entry & Business
Development · Strategic Partnerships & Investment Facilitation · Project,
Trade & Procurement Support · International Development & Regional
Programmes. Guarded by `tests/brand.test.ts` (with the company spelling
"Lamido, Lamido & Co." — never "Lanmido").

## Supabase schema & policies

- `enquiries` (privacy-minimizing fields, length CHECKs, UTC timestamps,
  status `new|in_review|contacted|closed`), `enquiry_events` (status-change
  audit log via trigger), `enquiry_rate_limits` (hashed-IP anti-spam,
  7-day pruning), `admin_users` (admin-role mechanism).
- **RLS default-deny on every table**; admin-only read/update via
  `is_admin()` (SECURITY DEFINER, pinned `search_path`, public execute
  revoked); **no client insert path** — enquiries are written only by the
  Edge Function with the service key. Owner verification:
  `supabase/verify-rls.sql`.
- Migrations are versioned under `supabase/migrations/` — add new ones,
  never edit applied ones.

## Tests (61, all passing)

Brand/spelling/manifest invariants (brand.test.ts) · enquiry validation +
every submission outcome via injected fetch (enquiry.test.ts) · admin CSV
formula-safety, status metadata, source-assertion security guards
(admin.test.ts) · SW cache hygiene + update-UX + hydration safety
(pwa-hygiene.test.ts) · canonical-URL resolver chain. QA tooling:
`scripts/link_check.py`, `scripts/a11y_audit.sh`, `scripts/contrast_audit.py`,
`scripts/responsive_sweep.sh`, `scripts/journey_tests.sh`.

## Known limitations (honest)

- Live form→database→admin journeys need the owner's Supabase project
  (checklist B in owner-launch-checklist.md); until then the form and admin
  show honest "not connected" states.
- On-device PWA installs and live-URL Lighthouse remain owner checks.
- Email notifications are not implemented (and not promised); Turnstile is
  built but OFF. No analytics exists.

## Free-tier boundaries & possible paid costs (checked 21 Oct 2026)

- **Vercel Hobby**: $0 but personal/non-commercial terms — a commercial plan
  (or Cloudflare Pages, $0 static) is required before public launch.
- **Supabase Free**: ample for a lead-gen MVP; **pauses after ~1 week of
  inactivity** (restorable); hard quotas on DB size/bandwidth/auth emails.
- **Possible costs later**: custom domain registration, a commercial hosting
  plan, paid email delivery (if notifications are ever added), Turnstile is
  free within Cloudflare limits. Re-verify all plan pages before launch.

## Where a future developer should start

1. `README.md` (setup, commands, troubleshooting, maintenance practices).
2. `src/lib/site.ts` + `src/lib/divisions.ts` — the content source of truth.
3. `docs/deployment.md` (hosting/Git workflow), then
   `docs/supabase-setup.md` (backend), `docs/enquiry-live-test.md` (form
   go-live), `docs/admin-onboarding.md` (admin provisioning).
4. Run the gate: `bun run lint && bun run typecheck && bun test && bun run build`.
5. History: `CHANGELOG.md` per stage; `docs/qa-report.md` for the audit
   record; `docs/pwa-verification.md` for measured performance.
