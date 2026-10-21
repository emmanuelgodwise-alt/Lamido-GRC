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
| 2 | Complete public website + five division detail pages | Not started |
| 3 | Supabase schema, migrations, RLS | Not started |
| 4 | Working enquiry form + lead capture | Not started |
| 5 | Protected admin dashboard | Not started |
| 6 | Full PWA, performance, accessibility pass | Partially pulled forward (installability); remainder not started |
| 7 | End-to-end QA, security review | Not started |
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
- **Supabase** arrives from Stage 3 (Postgres, Auth, RLS, Edge Functions).
  The browser will only ever hold the public URL + anon key.

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

- **Manifest** (`/manifest.webmanifest`): exact names "Lamido, Lamido & Co." /
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
  request (including all Supabase traffic), or enquiry submissions.
- **Offline**: `/offline` fallback states the device is offline; nothing is
  queued or silently replayed.
- Full on-device install verification (Android Chrome, iOS Safari) is a
  Stage 6 acceptance item.

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
├── docs/deployment.md       # GitHub + Vercel/Cloudflare deployment guide
├── public/
│   ├── brand/               # transparent logo, emblem, OG image
│   ├── icons/               # PWA icons (192/512 + maskable)
│   └── sw.js                # service worker (explicit cache rules)
├── scripts/
│   └── prepare_brand_assets.py  # icon/asset generation from source logo
├── src/
│   ├── app/                 # App Router pages (all static) + manifest.ts
│   ├── components/
│   │   ├── brand/           # logo lockup
│   │   ├── layout/          # header (accessible mobile menu), footer
│   │   ├── pwa/             # install provider, banner, buttons, SW register
│   │   └── ui/              # shadcn/ui component library
│   └── lib/                 # site/divisions/sectors/engagement config + styles
└── tests/brand.test.ts      # brand invariant + manifest tests
```

## Environment variables

| Variable | Scope | Notes |
| -------- | ----- | ----- |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical URL for metadata/OG. TODO(owner): production domain. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Required from Stage 3. Blank until then. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Required from Stage 3. Blank until then. Service-role keys NEVER go here. |

## Deployment

See **[docs/deployment.md](docs/deployment.md)** for exact GitHub push
commands, Vercel import steps (auto-deploy on every push), hosting plan terms
notes, the Cloudflare Pages $0 alternative, and rollback procedure.

## Owner TODOs

- [ ] Push the source zip to
      <https://github.com/emmanuelgodwise-alt/Lamido-GRC.git> (unzip →
      `git init` → commit → `git remote add origin` → push; exact commands in
      docs/deployment.md).
- [ ] Import to Vercel for development monitoring.
- [ ] Confirm the production domain and set `NEXT_PUBLIC_SITE_URL`.
- [ ] Supply official contact details for the Contact page (Stage 2).
- [ ] Before public launch: choose a hosting plan whose terms permit commercial
      use (Vercel Hobby is personal/non-commercial; see docs/deployment.md).
