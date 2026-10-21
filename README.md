# Lamido, Lamido & Co. — Corporate PWA

> Your Trusted Regional Representative and Strategic Partner in Northern Nigeria.

Production repository for the corporate Progressive Web App (PWA) of
**Lamido, Lamido & Co.** — a global resource company specializing in
representing foreign organizations, corporations, companies, and governments
in Northern Nigeria.

## Build status

| Stage | Scope | Status |
| ----- | ----- | ------ |
| 0 | Repository audit, plan, constraints | Done (audit performed before implementation) |
| 1 | Foundation, brand system, landing page, early deployment | **Complete** |
| 1+ | PWA install-on-first-visit (pulled forward from Stage 6 by owner instruction) | **Complete** (on-device testing completes in Stage 6) |
| 2 | Complete public website + five division detail pages | **Complete** |
| 3 | Supabase schema, migrations, RLS | **Complete** (live application is the owner's documented step — docs/supabase-setup.md) |
| 4 | Working enquiry form + lead capture | **Complete** (Edge Function deployment + live test = owner steps in docs/enquiry-live-test.md) |
| 5 | Protected admin dashboard | **Complete** (owner onboarding in docs/admin-onboarding.md) |
| 6 | Full PWA, performance, accessibility pass | **Complete** — update-prompt UX added; images/fonts optimized (Lighthouse mobile: Perf 93–94, A11y 100, CLS 0); on-device install tests remain owner-side (docs/pwa-verification.md) |
| 7 | End-to-end QA, security review | **Complete** — docs/qa-report.md (localhost-canonical defect found + fixed; 61/61 tests; 0 a11y/responsive findings; secret scan clean) |
| 8 | Production docs, deployment, handover | Not started |

Protocol: stages advance only on explicit owner approval, and completed stages
are never modified without prior approval.

## Stack

- **Next.js 16 (App Router) + TypeScript**, configured for **static export**
  (`output: "export"` → `out/`). No API routes, middleware, server actions, or
  SSR — hostable on any static host without a paid server runtime.
- **Tailwind CSS 4** + the shadcn/ui component library.
- **Playfair Display** (headings) + **Inter** (body), self-hosted at build time
  via `next/font` — no runtime font CDN.
- **PWA via web standards**: hand-written service worker (`public/sw.js`) and
  static manifest (`src/app/manifest.ts`). No third-party PWA plugin.
- **Supabase** (from Stage 3): Postgres, Auth, and Row Level Security for
  the enquiry backend. Schema and policies live in `supabase/migrations/`;
  see **[docs/supabase-setup.md](docs/supabase-setup.md)**. The browser only
  ever holds the public URL + anon key; the service-role key stays in
  Supabase Edge Function secrets.

## Getting started

Requires Node.js 20+. This repository uses **Bun** as its package manager
(deliberate, documented alternative — Vercel and Cloudflare Pages both support
`bun.lock`; standard `npm` commands also work).

```bash
bun install            # or: npm install
cp .env.example .env.local
bun run dev            # or: npm run dev  → http://localhost:3000
```

## Commands

| Command | What it does |
| ------- | ------------ |
| `bun run dev` | Development server on port 3000 |
| `bun run build` | Production static export → `out/` |
| `bun run lint` | ESLint (Next.js + TypeScript rules) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun test` | Unit tests (brand invariants + PWA manifest) |
| `bun run assets` | Regenerate brand/PWA icons from the archived source logo |

Local production preview: `bun run build && npx serve out`.

## PWA behaviour

- Manifest (`/manifest.webmanifest`): exact names "Lamido, Lamido & Co." /
  "Lamido & Co.", `display: standalone`, theme `#0B2E59`, background `#FFFFFF`,
  192px + 512px icons plus maskable variants.
- **Install-on-first-visit**: the banner appears as soon as the browser fires
  `beforeinstallprompt` (Chrome/Edge/Android) and triggers the native install
  flow. iOS Safari gets one-time "Add to Home Screen" guidance. Dismissal is
  remembered for 7 days; installed users never see it. Persistent
  **Install app** buttons appear in the header/footer once installable.
- **Service worker** (`public/sw.js`): versioned, explicit rules — pre-caches
  the offline page; cache-first for immutable static assets; network-first for
  public pages. **Never caches** `/admin`, `/api`, `/auth`, any cross-origin
  request (including all Supabase traffic), or enquiry submissions. Registered
  in **production only** — development never registers (and cleans up any
  leftover registration + `llc-*` caches) because dev chunks are not
  content-hashed and would serve stale code after edits; test install/offline
  behaviour with `bun run build && npx serve out`.
- **Offline**: `/offline` fallback states the device is offline; nothing is
  queued or silently replayed.
- Full on-device install verification (Android Chrome, iOS Safari) is a
  Stage 6 acceptance item.

## Enquiry backend & admin (Stages 3–5)

- Public form (`/contact`) submits through the **`create-enquiry` Supabase
  Edge Function** — server-side validation, honeypot, minimum completion
  time, and keyed-hash IP rate limiting (raw IPs never stored).
- Database security is **RLS default-deny** (no client insert path;
  admin-only read/update). See `supabase/verify-rls.sql`.
- **Admin dashboard** at `/admin`: Supabase Auth sign-in (no public
  registration), summary counts, search/filter, detail view, reversible
  status changes with activity log, private internal notes, and
  formula-injection-safe CSV export. Onboarding:
  **[docs/admin-onboarding.md](docs/admin-onboarding.md)**.

## Brand

- Official name: **Lamido, Lamido & Co.** — never "Lanmido". Guarded by tests.
- Tagline (exact): *Your Trusted Regional Representative and Strategic Partner
  in Northern Nigeria.*
- Tokens: navy `#0B2E59`, gold `#C99A35`, ink `#172334`, off-white `#F7F6F2`,
  white `#FFFFFF`.
- Logo: the official emblem is archived at
  `assets/brand/global-emblem-original.png` (owner-supplied, unmodified).
  Derived assets (transparent logo, emblem crop, PWA icons, favicon, OG image)
  live in `public/brand/` and `public/icons/` — regenerate with `bun run assets`.
  The text-heavy full logo is never used as an app icon; icons use the symbol
  crop.
- No fabricated clients, statistics, government seals, testimonials, or
  addresses appear anywhere; all pending company facts are marked as owner
  TODOs rather than invented.

## Project structure

```
├── assets/brand/            # archived source logo (for regeneration)
├── docs/
│   ├── deployment.md        # GitHub + Vercel/Cloudflare deployment guide
│   ├── pwa-verification.md  # Stage 6: install/update/offline test plan + measured CWV
│   ├── qa-report.md         # Stage 7: release-candidate audit record
│   └── supabase-setup.md    # backend setup + first-admin + RLS verification
├── public/
│   ├── brand/               # transparent logo, emblem, OG image
│   ├── icons/               # PWA icons (192/512 + maskable)
│   └── sw.js                # service worker (explicit cache rules)
├── scripts/
│   ├── prepare_brand_assets.py  # icon/asset generation from source logo
│   └── link_check.py        # built-site internal link verification
├── src/
│   ├── app/                 # App Router pages (all static) + manifest.ts
│   ├── components/
│   │   ├── brand/           # logo lockup
│   │   ├── contact/         # enquiry form
│   │   ├── layout/          # header (accessible mobile menu), footer
│   │   ├── pwa/             # install provider, banner, buttons, SW register
│   │   └── ui/              # shadcn/ui component library
│   └── lib/                 # site/divisions/sectors/engagement config, styles,
│                            # supabase client, validation
├── supabase/
│   ├── migrations/          # enquiries + admin mechanism + RLS (versioned)
│   └── verify-rls.sql       # owner-run security verification checklist
└── tests/brand.test.ts      # brand invariant + manifest tests
```

## Environment variables

| Variable | Scope | Notes |
| -------- | ----- | ----- |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical/OG/sitemap base. Optional on Vercel (deployment URL auto-detected); set to the custom domain when confirmed. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Required from Stage 3. Blank until then. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Required from Stage 3. Blank until then. Service-role keys NEVER go here. |

## Deployment

See **[docs/deployment.md](docs/deployment.md)** for Vercel import steps
(auto-deploy on every push), repository-restore-from-zip commands, hosting
plan terms notes, the Cloudflare Pages $0 alternative, and rollback procedure.

## Owner TODOs

- [x] Source pushed to <https://github.com/emmanuelgodwise-alt/Lamido-GRC.git>
      (21 Oct 2026, on owner instruction; details in docs/deployment.md).
- [x] Import to Vercel for development monitoring (completed 21 Oct 2026;
      pushes to `main` auto-deploy).
- [ ] Create the Supabase project, apply the migrations, and create the first
      admin — see [docs/supabase-setup.md](docs/supabase-setup.md).
- [ ] Deploy the `create-enquiry` Edge Function and run the live form test —
      see [docs/enquiry-live-test.md](docs/enquiry-live-test.md).
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
      Vercel, then trigger a redeploy (these values are baked at build time).
- [ ] Confirm the production domain and set `NEXT_PUBLIC_SITE_URL`.
- [ ] Supply official contact details for the Contact page (Stage 2).
- [ ] Before public launch: choose a hosting plan whose terms permit commercial
      use (Vercel Hobby is personal/non-commercial; see docs/deployment.md).
