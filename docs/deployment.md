# Deployment — Lamido, Lamido & Co. PWA

**Checked: 21 October 2026.** Provider terms and quotas change over time —
re-verify the linked pages before any public launch.

## Current state

- The repository builds to a fully static `out/` directory (`bun run build`).
- The remote `origin` is configured to the owner-created repository
  **<https://github.com/goddiejohnson732-ops/Lamido-GRC.git>**
  (verified reachable and empty on 21 October 2026 — no branches yet, so a
  plain push works without conflicts).
- **As of Stage 1 completion, no GitHub push and no external deployment have
  been performed by z.ai** — no repository credentials are held, and none were
  requested. The owner performs both steps below.
- Development preview is available in the z.ai workspace preview panel.

## 1. Push to GitHub (owner steps)

The repository already contains clean commits on the `main` branch, and the
remote `origin` is already configured to the owner-created repository
`goddiejohnson732-ops/Lamido-GRC` — no `git remote add` is needed.

If you cloned/moved the project to a fresh machine, set your identity first:

```bash
git config user.name  "Your Name"
git config user.email "you@example.com"
```

Then push (the remote is empty, so there are no conflicts):

```bash
cd path/to/lamido-lamido-co
git push -u origin main
```

Authentication options (pick one, both free):

- **HTTPS + GitHub CLI:** `gh auth login` once, then `git push` as above.
- **SSH:** if you prefer SSH keys, point the remote at the SSH form first:

  ```bash
  git remote set-url origin git@github.com:goddiejohnson732-ops/Lamido-GRC.git
  ```

Never paste personal access tokens into any chat or tool prompt.

## 2. Deploy to Vercel (owner steps)

1. Sign in at [vercel.com](https://vercel.com) → **Add New → Project** →
   **Import** the Git repository `goddiejohnson732-ops/Lamido-GRC` (after the
   push in step 1).
2. Framework preset: **Next.js** (auto-detected). Build command stays the
   default (`next build`). Static export (`output: "export"`) is detected
   automatically; the `out/` directory is served.
3. Environment variables (optional at this stage):
   `NEXT_PUBLIC_SITE_URL` = your deployment URL (update to the custom domain
   later).
4. **Deploy.** Every push to `main` now auto-deploys — use the Vercel
   dashboard (Deployments, Logs, Analytics) to monitor development progress.
5. After the first deploy, verify on the live URL:
   - `/manifest.webmanifest` loads (correct name/icons).
   - Chrome DevTools → Application → Service Workers: `sw.js` activated.
   - Application → Manifest: installability criteria satisfied.
   - `/offline` loads; toggle DevTools offline + reload a page → offline page.
   - Install prompt banner appears on first visit (Chrome/Edge desktop,
     Android Chrome) and the app installs.

### Vercel plan terms (checked 21 Oct 2026)

- The Vercel **Hobby** plan is designated for **personal, non-commercial**
  use — see <https://vercel.com/legal/terms> and
  <https://vercel.com/docs/plans/hobby>.
- Using a Hobby project to monitor development progress is at the owner's
  discretion. The **live commercial company site** should run on a plan whose
  current terms permit commercial use (e.g. Vercel Pro) **or** on a $0 static
  alternative such as Cloudflare Pages.
- The repository stays fully portable either way: `out/` runs on any static
  host.

## 3. $0 alternative: Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages →
   Create → Pages → Connect to Git** — select the repository.
2. Build settings: build command `npx next build`, output directory `out`
   (the static export). Node 20+.
3. Check the current Pages terms/quotas before launch:
   <https://developers.cloudflare.com/pages/>.

## Local verification checklist

```bash
bun run lint && bun run typecheck && bun test && bun run build
npx serve out
```

- Direct-load every route (e.g. `/services`, `/how-we-work`, `/offline`).
- Trigger a 404 (e.g. `/nope`) → custom not-found page.
- Resize to 360/390/768/1280/1440 px — no horizontal overflow.
- Keyboard-only navigation: skip link, menus, focus rings visible.

## Rollback

- **Vercel:** Deployments → open the last known-good deployment → **Promote**.
- **Git:** `git revert <commit> && git push` — the revert auto-deploys.

## Cost honesty

A $0 start is a goal, not a guarantee forever: a registered custom domain,
paid email delivery, a commercial hosting plan, increased usage quotas, or
some third-party services may cost money. Supabase Free is quota-limited and
pauses inactive projects. This document records what was true on the check
date above — re-verify before launch and update this file.
