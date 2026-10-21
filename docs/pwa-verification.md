# PWA Verification — Install, Update, Offline, Cache Exclusions

**Stage 6 record. Checked: 21 October 2026.** This document separates what
was **verified automatically** in the build environment from what requires
**owner device testing** on real phones. Nothing below is claimed verified
until it is checked off.

## Automatically verified (build environment)

| Item | Method | Result |
| --- | --- | --- |
| Manifest validity (name, short name, display, colors, start URL, icons) | `tests/brand.test.ts` — 9 assertions over the generated manifest | Pass |
| Icons (192/512 + maskable + apple-touch + favicon) generated from the emblem crop, never the wordmark | `scripts/prepare_brand_assets.py` + tests | Pass |
| Service worker rules (versioned `llc-v2`, cache-first static, network-first navigations, network-only `/admin` `/api` `/auth` + cross-origin) | `tests/pwa-hygiene.test.ts` + `tests/admin.test.ts` source guards | Pass |
| Old-cache purge on activation (every cache not ending `llc-v2` is deleted) | `tests/pwa-hygiene.test.ts` + live check: fresh browser held only `llc-precache-llc-v2` / `llc-runtime-llc-v2` | Pass |
| SW registers in production only; dev self-heals (unregisters + purges `llc-*`) | `tests/pwa-hygiene.test.ts`; dev browser shows 0 registrations, 0 caches | Pass |
| Update prompt refreshes only on explicit user click (no auto-reload; admin work warned) | `tests/pwa-hygiene.test.ts` source guards | Pass |
| Offline page exists, is pre-cached, and contains no misleading success state | Build output + `scripts/link_check.py` | Pass |
| No push-notification infrastructure | Scope held (none added) | Pass |

## Measured Core Web Vitals (Lighthouse 13, mobile emulation, slow 4G)

Measured against the local production build (`bun run build` + static server),
Lighthouse default mobile emulation (Moto G class, throttled CPU + slow 4G).
Real-device results on the Vercel deployment (brotli, edge cache) are expected
to be better; re-measure on the live URL before launch (Stage 8 checklist).

Targets: LCP ≤ 2.5 s · CLS ≤ 0.1 · TBT ≤ 200 ms · FCP ≤ 1.8 s.

| Page | Perf | A11y | LCP | CLS | TBT | FCP |
| --- | --- | --- | --- | --- | --- | --- |
| `/` (home) | 93 | 100 | 2.9 s | 0 | 180 ms | 1.0 s |
| `/services/…` (division) | 93 | 100 | 2.7 s | 0 | 80–210 ms* | 1.0 s |
| `/contact` | 94 | 100 | 2.9 s | 0 | 130 ms | 1.0 s |

\* TBT fluctuates with the simulated throttling run; observed range 80–210 ms.
Un-throttled observed first paint: 261 ms. LCP sits ~0.2–0.4 s above target
under the harshest simulated profile; the payload work below was done to close
the gap as far as static-export + branded webfonts allow.

**Optimization actions already applied (Stage 6):**

- Brand images right-sized: header emblem 391 KB → 5 KB, footer wordmark
  909 KB → 18 KB, home emblem 391 KB → 33 KB (2× display resolution, 256-colour
  PNG). The two oversized originals no longer ship.
- Fonts: one **variable** WOFF2 per family (Inter 48 KB, Playfair 38 KB)
  instead of seven duplicated files (293 KB) — each family now downloads once
  and all weights (400/500/600) render from the `wght` axis.
- No third-party/render-blocking scripts; JSON-LD is inline; images carry
  explicit width/height (CLS 0); motion respects `prefers-reduced-motion`.
- Note: Lighthouse reports ~88 KiB "unused JavaScript" — these are Next.js
  route-prefetch chunks for linked pages (intentional navigation speed-up),
  not dead code.

## Owner device tests (required before claiming installability "done")

Perform on the **live HTTPS deployment** (Vercel URL). Browser differences are
expected — the product never promises identical prompts everywhere.

### Android — Chrome

1. Open the site URL in Chrome (not in the PWA preview panel).
2. Expect the **install banner** shortly after first visit; tap **Install** →
   the native install sheet appears → confirm.
3. Home screen icon: emblem crop (LL monogram + globe), correct app name
   "Lamido, Lamido & Co.".
4. Launch from home screen: opens **standalone** (no browser UI), navy theme
   color in the title bar area.
5. Turn on airplane mode → revisit an already-visited page: cached page or
   the offline page loads (never an error page or fake success).
6. Chrome menu → "Install app" also works when the banner was dismissed.

### iOS — Safari

1. Open the site in Safari. Expect **one-time** "Add to Home Screen" guidance
   (Share icon → Add to Home Screen). Dismiss with "Got it" — it must never
   return (localStorage), even after reopening.
2. Add to Home Screen via Safari's Share sheet → icon + standalone launch.
3. Verify the fixed banners (install guidance, update toast, if shown) stay
   clear of the home-indicator area (safe-area insets are applied).

### Update behaviour (any desktop browser)

1. After a new deployment, reload the site with the tab from the old version
   still open → a **"A new version is available"** toast appears
   bottom-left (never auto-reloads).
2. On `/admin` with an unsaved note, the toast additionally reads "Save any
   unsaved work first" — refreshing is always the user's explicit choice.
3. Click **Refresh** → SKIP_WAITING + reload → new version active
   (check footer or a changed element).
4. Click **Later** or press **Escape** → toast disappears for the session.

### Cache-exclusion checklist (DevTools, any Chromium browser)

1. Open DevTools → **Application → Service Workers** → verify `sw.js` is
   activated, and note the version comment in the source.
2. **Application → Cache Storage**: only `llc-precache-llc-v2` and
   `llc-runtime-llc-v2` exist; after any future version bump the old caches
   disappear on activation.
3. Sign in to `/admin`, browse enquiries, then re-check **Cache Storage**:
   **no** `/admin` documents, **no** Supabase API responses, **no** enquiry
   submissions are ever cached (network-only).
4. Network tab: confirm calls to the Supabase project URL bypass the service
   worker's cache (they appear as regular network requests).
5. Submit the contact form offline → the honest failure/offline state shows;
   nothing is queued or auto-submitted later.

## Honest limitations

- Install prompts are browser-controlled; some browsers/versions never fire
  `beforeinstallprompt` (e.g. iOS Safari, some enterprise Chrome policies) —
  the product degrades gracefully (iOS guidance path, persistent footer
  install button where available).
- The install banner's *dismissal memory* (7 days) and iOS one-time hint rely
  on `localStorage`; private/incognito windows will show them again — accepted
  behaviour.
- Live-URL Lighthouse re-measurement and real-device CWV field data are
  Stage 8 / owner-launch items, not claimed here.
