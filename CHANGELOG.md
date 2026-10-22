# Changelog

All notable changes to the Lamido, Lamido & Co. PWA are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/); versioning
follows [Semantic Versioning](https://semver.org/).

## [0.8.1] — 2026-10-22

Header refinements — owner corrections on the live site.

### Changed

- **The header bar now spans the full viewport width (100%)**: the brand
  lockup and the menu sit at opposite ends of the bar with even left/right
  padding, instead of being boxed to the same maximum width as the page
  body and hero section.
- **Short navy separator bars between the desktop menu items** (brand blue,
  `#0B2E59`) — a subtle divider rhythm between the six primary links.
- Slightly tighter desktop link padding so the full-width bar also fits
  1024px-wide screens with the install affordance visible.

### Removed

- **"Request a Consultation" button removed from the desktop header**
  (owner correction; desktop widths `>=1024px`). The CTA remains available
  in the mobile menu and throughout the page bodies — hero, division and
  sector pages, "How We Work", About, the footer, and the contact form.

## [0.8.0] — 2026-10-21

Stage 8 — production-ready docs, Git workflow, repository cleanliness, and
handover. (Deployment itself is owner-operated via the configured Vercel
integration; this stage makes the repository fully self-explanatory.)

### Removed — repository cleanliness (doc: "no dead code, no unused packages")

- The entire scaffolded **shadcn/ui library (`src/components/ui/`, 40 files)
  and `src/hooks/`** — provably imported by zero product code (the site uses
  bespoke Tailwind primitives over native elements). `components.json` is
  kept so the shadcn CLI can add components later if ever wanted.
- **30 unused dependencies**: all 27 `@radix-ui/*` packages,
  `class-variance-authority`, `cmdk`, and `tw-animate-css` (its utilities
  were used only by the removed components). Installs are faster and the
  dependency set now matches the code exactly.
- Verified clean afterwards: lint 0/0, typecheck clean, 61/61 tests, 20
  routes, 818/818 links, zero console errors, pages render identically.

### Added

- **docs/handover.md** — architecture, routes, divisions, Supabase
  tables/policies, tests, known limitations, free-tier boundaries, possible
  paid costs, and where a future developer starts.
- **docs/owner-launch-checklist.md** — every remaining owner item in one
  place: content placeholders (contact details, legal review, domain),
  backend go-live steps, the commercial-hosting decision, device/live-URL
  verification, optional features (off by default), and security hygiene.
- README **Troubleshooting** and **Safe maintenance practices** sections;
  stack description corrected (bespoke Tailwind design system); structure
  tree matches reality.
- docs/deployment.md **Git workflow** section (stable `main` + preview
  branches; commits deploy only via the provider integration; no custom
  deploy scripts; build output never committed).

### Changed

- `.env.example` documents the automatic Vercel URL detection for
  `NEXT_PUBLIC_SITE_URL`.

## [0.7.0] — 2026-10-21

Stage 7 — release-candidate audit: end-to-end QA, security review,
regression, content polish. Full evidence: **[docs/qa-report.md](docs/qa-report.md)**.

### Fixed

- **localhost URLs baked into deployed builds (high):** with
  `NEXT_PUBLIC_SITE_URL` unset, canonical tags, OG URLs, sitemap, robots and
  JSON-LD in the live deployment pointed at `http://localhost:3000`. New
  `resolveSiteUrl()` prefers the owner domain, then Vercel's auto-provided
  `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`; localhost is now only the
  local-dev fallback. Verified with a simulated-Vercel build (all emitted
  URLs clean). The live site is healed once this stage is deployed.
- Removed a stray local (gitignored, never committed) QA `.env` that masked
  the honest not-configured states; both states re-verified.

### Added

- **docs/qa-report.md** — tests run, outcomes, screen sizes, security
  checklist item-by-item, findings + remediation, and a clear
  tested / not-tested / owner-required split.
- **Tests** (5 new; 61 total): canonical-URL resolver priority chain
  (explicit domain > Vercel production URL > deployment URL > dev fallback).

### Verification (all passing)

- Lint 0/0; typecheck clean; 61/61 tests; 20 static routes; link check
  818/818; accessibility probe 16 routes × {1280, 320} px — 0 findings;
  responsive sweep 7 routes × 5 sizes (360/390/768/1280/1440) — 0 findings;
  contrast 27/27; Lighthouse Perf 93–94 / A11y 100 / SEO 100 / BP 100.
- Public journey scripted end-to-end (all steps pass); admin journey's
  credential-free states pass; live-backend journeys listed as owner steps.
- Secret scan of the tracked tree: no token/key patterns; build scan: no
  baked project URLs or keys. Copy scans: no placeholders, no fake claims,
  no analytics/tracking.

## [0.6.0] — 2026-10-21

Stage 6 — PWA update behaviour, performance, and accessibility pass. (The
manifest/icons/install banner/offline page were pulled forward into Stage 1;
this stage audited the remainder of the doc line-by-line and closed every
remaining gap.)

### Added

- **Update-available toast** (`src/components/pwa/update-prompt.tsx`): when a
  new service worker waits, a polite `role="status"` toast offers Refresh /
  Later (Escape dismisses). It **never auto-reloads** — the refresh happens
  only on the user's explicit click (SKIP_WAITING → controllerchange →
  reload), so form input and unsaved admin notes are never lost; on `/admin`
  it explicitly says "Save any unsaved work first".
- **docs/pwa-verification.md**: what was automatically verified vs. what
  requires owner devices — Android Chrome / iOS Safari install steps, update-
  behaviour test, DevTools cache-exclusion checklist, measured Core Web
  Vitals, and honest limitations.
- **Tests** (4 new; 56 total): SKIP_WAITING flow, `/api` + `/auth` cache
  exclusions, user-action-only refresh + admin-work warning, layout mounts
  the prompt.

### Changed — accessibility (systematic audit: 16 routes × 2 widths, 0 open findings)

- Five pages had no `<h1>` (About, Services, Sectors, How We Work, Contact) —
  `SectionHeading` gained a `level` prop; page titles are now `h1`, in-page
  sections remain `h2`; the How We Work cycle steps moved to `h2` under it.
- Admin "Forgot the administrator password?" link enlarged to a 44px target
  (was 20px — WCAG 2.2 AA target-size fail).
- **Formal contrast pass (27/27 pairs pass)**: new `--gold-ink` token
  (#8a6714) for gold text on light surfaces (eyebrows, division numbers, 404
  numeral, logo descriptor, in_review chip — pure gold failed at 2.4–2.6:1);
  new `--gold-hover` (#c19132) keeps navy-on-gold buttons ≥ 4.5:1 on hover;
  all body text below ink/65 (50/55/60) and light placeholders raised to
  /65; footer white/45–50 raised to /55; decorative numerals/icons marked
  `aria-hidden`.
- Logo link's `aria-label` now contains its full visible text (label-content-
  name match).

### Changed — performance (Lighthouse mobile emulation, slow 4G)

- **Brand images right-sized**: header emblem 391 KB → 5 KB, footer wordmark
  909 KB → 18 KB, home emblem 391 KB → 33 KB (2× display, 256-colour PNG via
  `prepare_brand_assets.py`); the two oversized originals no longer ship.
- **Font duplication fixed**: the seven "weight" files were the same two
  variable fonts duplicated (Google serves variable files to modern UAs) —
  now one variable WOFF2 per family ships (293 KB → 86 KB) and weights
  400/500/600 render from the `wght` axis; `fetch_fonts.py` corrected.
- Safe-area insets (`env(safe-area-inset-bottom)`) on the fixed install
  banner and update toast for notched devices.
- Measured (before → after): performance 83/82/70 → **93/93/94**; LCP
  4.3/4.3/7.4 s → **2.9/2.7/2.9 s**; TBT ≤ 180 ms; CLS 0; A11y 100 on all
  three audited pages. Accessibility probe across all 16 routes at 1280px
  and 320px: **0 findings** (was 22).

### Verification

- Lint/typecheck clean; 56/56 tests; 20 static routes; link check 893
  links/assets across 17 pages all resolve; zero console errors in dev and
  production-served builds; VLM visual check confirms semi-bold headings
  render correctly from the variable fonts and gold labels are legible.

## [0.5.1] — 2026-10-21

Fix — hydration-mismatch report (owner): "server rendered HTML didn't match
the client" at the header actions cluster.

### Diagnosis

- The reported client tree carried Stage 1 markup (no `max-sm:hidden`
  install-button wrapper, Stage 1 consultation-CTA classes) while the server
  HTML contained the Stage 2+ markup — i.e. the browser executed
  **stale Stage-1-era JavaScript against freshly rendered Stage-2-5 HTML**.
- Current source is hydration-safe by construction (install state starts
  from static values; every browser API read lives inside effects). The
  mismatch came from cached stale JavaScript, not from render-time
  client/server branching.

### Changed

- **Service worker version bumped `llc-v1` → `llc-v2`** (`public/sw.js`): on
  activation the worker already deletes every cache whose name does not end
  with the current version, so every existing visitor's browser purges all
  Stage-1-era caches — no visitor can be served assets cached from an
  earlier deployment against current HTML.
- **Registration is now production-only**
  (`src/components/pwa/service-worker-register.tsx`): dev-server chunks are
  not content-hashed, so a cache-first worker in development could serve
  pre-edit JavaScript with post-edit HTML — the exact reported failure.
  Development now never registers the worker and **self-heals**: it
  unregisters any leftover registration and purges `llc-*` caches, so
  browsers that registered the dev worker recover on the next visit.
  Install/offline behaviour is verified against a production build
  (`bun run build && npx serve out`).

### Added

- **Tests** (`tests/pwa-hygiene.test.ts`, 5 new; 52 total passing):
  sw.js version is `llc-v2`; activation purges older caches; registration is
  production-only; development unregisters leftovers and purges `llc-*`
  caches; the install provider starts from static state (no lazy client
  reads during render).

### Verification

- Lint/typecheck clean; 52/52 tests; 20 static routes built.
- Dev server: home page loads with zero console errors and no service worker
  registered; production build served locally: worker registers, controls
  the page, zero console errors.

## [0.5.0] — 2026-10-21

Stage 5 — protected admin dashboard for enquiries.

### Added

- **`/admin` client route** (static-export compatible, `noindex`, excluded
  from sitemap, disallowed in robots.txt, never cached by the service
  worker): Supabase Auth email/password sign-in with password-recovery
  path, **no public self-registration** — accounts are provisioned by the
  owner (documented).
- **Dashboard**: summary counts (new / in review / contacted / closed) as
  clickable filters; searchable (reference, name, email, organization,
  subject) and status-filtered enquiry list with bounded pagination;
  accessible table on desktop and stacked cards on mobile.
- **Detail view**: full enquiry record, reversible status changes recorded
  by the DB audit trigger (Activity timeline), and private internal notes
  (length-capped, admin-only, excluded from public CSV columns).
- **Safe CSV export**: client-side generation for the current filter (up to
  500 rows), spreadsheet **formula-injection protection** (`=`, `+`, `-`,
  `@`, tab, CR cells neutralized), UTC-timestamped filename, no public
  download URL.
- **Security posture**: every query runs under the signed-in session —
  database RLS fails closed for non-admins (UI state machine is UX only);
  sign-out/expiry clears all private UI state; honest not-admin and
  not-configured states; no enquiry content in URLs or logs.
- **docs/admin-onboarding.md**: owner guide — security model, creating
  additional admins, sign-in, passwords, responsible use, troubleshooting.
- **Tests** (16 new; 47 total passing): CSV formula-safety across all
  dangerous prefixes, RFC 4180 quoting, filename format, status metadata
  matching the DB CHECK constraint, notes limit mirroring the migration,
  and source-assertion guards (SW /admin exclusion, robots, noindex, no
  service-role usage in admin code).

### Verification

- Lint/typecheck clean; 47/47 tests; 20 static routes built; link check OK.
- `/admin` verified at 390/360px (production build) and full 12-route sweep
  at 390px after clearing dev service-worker caches (dev-only staleness
  documented; production uses content-hashed asset URLs, immune).
- Live sign-in/data journeys require the owner's Supabase project — the
  documented manual checklist covers them; nothing is claimed as remotely
  verified.

## [0.4.0] — 2026-10-21

Stage 4 — working enquiry form and reliable lead capture.

### Added

- **`src/lib/validation/enquiry.ts`**: dependency-free shared rulebook
  (required fields, lengths, allowed values, email format, whitespace
  normalization, consent, honeypot, minimum completion time, and a
  mass-assignment guard rejecting unexpected fields) — executed in the
  browser, in the Edge Function, and in tests.
- **`create-enquiry` Supabase Edge Function**: the only writer of public
  enquiry rows — CORS origin allow-list, method/size checks, server-side
  validation, HMAC-keyed IP hashing for rate limiting (raw IPs never
  stored; records pruned after 7 days), collision-safe reference IDs
  (`LLC-YYMMDD-XXXXXX`), service-role client used only inside the function,
  safe non-sensitive error responses, no payload logging.
- **Full enquiry form** (all brief fields): per-field errors with
  `aria-invalid`/`aria-describedby` and focus management, sending state
  with duplicate-submit guard, success confirmation with reference ID,
  honest network/backend/offline/rate-limited/origin-blocked states that
  always retain user input, and an honest not-configured panel.
- **docs/enquiry-live-test.md**: owner Edge Function deployment (secrets,
  link, deploy) + 10-step manual live test plan.
- Privacy Notice updated: secured server function, 7-day hashed-IP
  anti-spam disclosure, explicit no-email-notification honesty.
- **Tests** (22 new): validation rules, allowed-value sync with the typed
  configs, every network outcome via injected fetch, request-body
  secret-leak guards. tsconfig excludes Deno function code from the
  Next.js typecheck (Deno checks it at deploy).

## [0.3.0] — 2026-10-21

Stage 3 — Supabase schema, migrations, Row Level Security, and the secure
backend foundation. (No live Supabase project is required to read this code;
applying it to a live project is the owner's documented step — nothing is
claimed as remotely applied.)

### Added

- **Migrations** (`supabase/migrations/`, versioned, run in order):
  - `20261021000001_enquiries.sql` — `enquiries` table (privacy-minimizing
    fields from the brief, length checks, UTC timestamps, statuses
    new/in_review/contacted/closed, admin-only notes/assignment),
    `enquiry_events` lightweight status-change log, `enquiry_rate_limits`
    anti-spam records, indexes, `updated_at` trigger.
  - `20261021000002_admin_rls.sql` — `admin_users` (the admin-role mechanism
    linked to Auth user ids), `is_admin()` SECURITY DEFINER function with
    pinned `search_path` and revoked public execute, **RLS default-deny on
    every table**, admin-only read/update policies, **no client insert path**
    (enquiries are written only by the Stage 4 Edge Function with the service
    role), status-change audit trigger.
- **RLS verification checklist** (`supabase/verify-rls.sql`): repeatable SQL
  Editor blocks proving anonymous users cannot read/create enquiries,
  non-admin authenticated users cannot read/manage or self-elevate, and only
  authorized admins can read/update.
- **Supabase browser client** (`src/lib/supabase/client.ts`): URL + anon key
  only (public-by-design values); returns null when unconfigured so UI shows
  honest states; the service-role key never appears in the client.
- **docs/supabase-setup.md**: click-by-click owner guide — create the free
  project, apply migrations, create the first admin (no public sign-up),
  verify RLS, connect env vars; current free-plan quota facts and links.
- `@supabase/supabase-js` dependency (deliberate re-add per approved scope).

### Verification

- `bun run lint` / `bun run typecheck` / `bun test` — all passing.
- `bun run build` — 19 static routes exported (unchanged public surface).
- SQL reviewed against the brief's security baseline; live RLS execution is
  verified by the owner via `supabase/verify-rls.sql` (documented, not
  claimed done remotely).

### Known limitations

- No live Supabase project is connected yet (owner step, documented).
- The public form still cannot submit until the Stage 4 Edge Function is
  deployed (the form shows an honest "not available" state meanwhile).

## [0.2.0] — 2026-10-21

Stage 2 — complete public website and all five service divisions.

### Added

- **Content configurations** (single typed sources of truth): division detail
  content (purpose, client problems, typical engagement flow, client types,
  deliverables, boundaries per division — `src/lib/division-details.ts`),
  sector support examples, and the five working practices (documentation,
  partner verification, transparent engagement, confidentiality,
  follow-through).
- **Full public pages** (all static HTML): About (positioning, mandate-based
  model, responsible-representation governance section), Services overview,
  **five individual service-division detail pages** (SSG via
  `generateStaticParams`; purpose, challenges, subservices, engagement flow,
  client types, deliverables, boundaries/disclaimer, prev/next navigation),
  Sectors (labelled areas of support, not past-work claims), How We Work
  (five-step cycle + working standards), Contact (engagement steps, what to
  prepare, and the complete enquiry form shell with honest
  activation-pending state), Privacy Notice and Terms of Use working drafts
  with clearly-marked owner/legal review notes.
- **SEO**: per-page metadata titles/descriptions, canonical URLs, sitemap.xml
  and robots.txt (static, admin/offline excluded), Organization JSON-LD with
  verified details only (name, url, logo — nothing invented).
- **Design system additions**: form field primitives (field, label, error,
  hint) mapped to brand tokens.
- **QA tooling**: `scripts/link_check.py` — verifies every internal link and
  asset in the built site resolves.

### Changed

- Footer, home teaser cards, and About now link to the division detail routes
  (`/services/<division>`).
- Hero eyebrow ("Global Resource Company") removed per owner correction —
  the descriptor remains in the navbar logo lockup and metadata only.
- Header install button hidden below `sm` (fixed a 25px horizontal overflow
  at 360–390px that appeared once the browser became installable).

### Removed

- `PageInPreparation` stub component — all routes now carry full content.

### Verification (all passing)

- `bun run lint` — 0 errors; `bun run typecheck` — clean; `bun test` — 9/9.
- `bun run build` — 19 static routes exported.
- Link check — 840 internal links/assets across 16 built pages all resolve.
- Responsive — production build verified at 360/375/390/1280 px across all
  routes: no horizontal overflow, no console errors; VLM visual QA of phone
  and desktop screenshots passed.

### Known limitations

- Contact form cannot submit yet (Stage 4 connects it to the Edge Function).
- Official contact details, retention periods, and governing law remain
  clearly-marked owner placeholders in Contact/Privacy/Terms.


## [0.1.0] — 2026-10-21

Stage 0 (audit) + Stage 1 (foundation, brand system, landing page) +
owner-approved pull-forward of the PWA install-on-first-visit feature from
Stage 6, plus GitHub-ready repository preparation.

### Added

- **Brand asset pipeline** (`scripts/prepare_brand_assets.py`): transparent
  full-logo and emblem-crop variants derived from the owner-supplied official
  logo (source archived at `assets/brand/global-emblem-original.png`), PWA
  icons (192/512 + maskable), favicon (16/32/48), apple-touch-icon, and a
  1200×630 Open Graph card.
- **Design system**: navy/gold brand tokens mapped into Tailwind CSS 4 and
  shadcn/ui semantic tokens; Playfair Display + Inter typography
  (self-hosted); buttons, cards, section rhythm, focus-visible states, skip
  link, reduced-motion support.
- **Responsive site chrome**: sticky header with desktop nav (active states)
  and an accessible mobile menu (Escape, outside click, focus trap, focus
  return, scroll lock); complete footer with logo plate, division links, and
  consultation CTA.
- **Home page**: hero with the exact official tagline and consultation CTAs;
  company introduction with mandate/confidentiality/focus highlights; five
  service-division teaser cards (exact names, numbering 01–05); sectors
  overview; five-step engagement cycle (Discover → Assess → Connect →
  Coordinate → Report); responsible-representation principles; closing CTA.
- **Route stubs** (content scheduled for Stage 2): About, Services (with the
  five divisions + subservices and anchors), Sectors, How We Work, Contact,
  Privacy Notice, Terms of Use — plus custom not-found and offline pages.
  No dead CTAs.
- **PWA install-on-first-visit** (owner-approved pull-forward): static
  manifest (`src/app/manifest.ts`), install banner driven by
  `beforeinstallprompt` with 7-day dismissal memory, one-time iOS Safari
  guidance, persistent install buttons, `appinstalled`/standalone detection.
- **Service worker** (`public/sw.js`): versioned, explicit cache rules;
  pre-caches the offline page; cache-first immutable assets; network-first
  public pages; never caches `/admin`, `/api`, `/auth`, cross-origin
  (Supabase) traffic, or submissions.
- **Starter tests** (`tests/brand.test.ts`): brand invariants (exact company
  name, tagline, five divisions, five sectors, engagement cycle) and PWA
  manifest installability fields. 9 tests, all passing.
- **Documentation**: README (setup, commands, structure, owner TODOs),
  docs/deployment.md (GitHub push, Vercel import, plan terms, Cloudflare
  Pages alternative, rollback), .env.example with safe placeholders.

### Changed

- Project configured for **static export** (`output: "export"`), making the
  frontend hostable on any static host without a paid server runtime;
  build produces `out/`.
- TypeScript build errors are no longer ignored; strict typecheck passes.

### Removed

- Scaffold demo content: demo API route (incompatible with static export),
  demo page, and 31 unused dependencies (Prisma, next-auth, recharts, dnd-kit,
  mdxeditor, z-ai-web-dev-sdk, etc.) — the dependency set now matches the
  approved scope; later stages re-add packages deliberately.

### Verification (all passing)

- `bun run lint` — 0 errors, 0 warnings.
- `bun run typecheck` — clean.
- `bun test` — 9/9 pass.
- `bun run build` — 12 static routes exported.
- Browser QA — no page errors; no horizontal overflow at 360/390/768/1280/1440
  px; mobile menu keyboard/Escape/focus checks pass; Tab order with visible
  focus verified; service worker registered and controlling; visual review of
  phone + desktop screenshots passed (logo, hero, cards, footer, contrast).
- Not yet verified (honest note): native install prompt on a real HTTPS
  deployment and on physical devices — Stage 6 acceptance items.

### Known limitations

- Stub pages carry "content in preparation" notices until Stage 2.
- No enquiry form or backend yet (Stages 3–4); no admin area (Stage 5).
- `NEXT_PUBLIC_SITE_URL` defaults to a placeholder until the owner sets the
  production domain; social preview URLs will use it once set.
- Full SEO pass (sitemap, per-page canonicals) is scheduled for Stage 2.
