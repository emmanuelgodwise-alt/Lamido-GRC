# Changelog

All notable changes to the Lamido, Lamido & Co. PWA are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/); versioning
follows [Semantic Versioning](https://semver.org/).

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
