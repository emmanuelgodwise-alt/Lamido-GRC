# Changelog

All notable changes to the Lamido, Lamido & Co. PWA are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/); versioning
follows [Semantic Versioning](https://semver.org/).

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
