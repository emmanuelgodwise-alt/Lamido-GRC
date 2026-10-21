# Deployment — Lamido, Lamido & Co. PWA

**Checked: 21 October 2026.** Provider terms and quotas change over time —
re-verify the linked pages before any public launch.

## Current state

- The project builds to a fully static `out/` directory (`bun run build`).
- **No GitHub push and no external deployment have been performed by z.ai** —
  no repository credentials are held, and none were requested. The owner
  performs both steps below.
- Handover format: the downloadable source zip **`Lamido-GRC-stage-1.zip`**
  contains the complete verified project tree (application code, brand
  assets, configs, docs) with **no** git history, no `node_modules`, and none
  of the z.ai workspace infrastructure. Section 1 starts from that zip.
- The GitHub repository **emmanuelgodwise-alt/Lamido-GRC** was verified
  reachable and empty on 21 October 2026 — a first push lands cleanly with no
  conflicts. It supersedes the earlier, still-empty repository
  `goddiejohnson732-ops/Lamido-GRC`.
- A direct push from the z.ai workspace was attempted on owner instruction and
  rejected by GitHub with `fatal: could not read Username` — the workspace
  deliberately holds no GitHub credentials, so only the owner (or anyone the
  owner authorizes with their own credentials) can push.
- Development preview is available in the z.ai workspace preview panel.

## 1. Push to GitHub (owner steps)

Unzip the source zip and push it as a fresh repository (the GitHub
repository `emmanuelgodwise-alt/Lamido-GRC` is empty, so there are no
conflicts):

```bash
unzip Lamido-GRC-stage-1.zip && cd Lamido-GRC

git init
git config user.name  "Your Name"        # skip if git identity is already set
git config user.email "you@example.com"  # skip if git identity is already set
git add .
git commit -m "feat(stage-1): brand foundation, responsive home page, and PWA install-on-first-visit"
git branch -M main
git remote add origin https://github.com/emmanuelgodwise-alt/Lamido-GRC.git
git push -u origin main
```

Authentication options (pick one, both free):

- **HTTPS + GitHub CLI:** `gh auth login` once, then `git push` as above.
- **SSH keys:** use the SSH remote form instead:

  ```bash
  git remote set-url origin git@github.com:emmanuelgodwise-alt/Lamido-GRC.git
  ```

Never paste personal access tokens into any chat or tool prompt.

### No-git alternative: upload via GitHub's web UI

1. Download and unzip the source zip, then open the unzipped `Lamido-GRC`
   folder.
2. On the empty repository page, choose **Add file → Upload files**.
3. Drag the **contents** of the folder (not the folder itself) into the
   browser window — including the hidden files `.gitignore` and
   `.env.example` (enable "show hidden files" in your file manager first).
4. GitHub's web upload accepts at most 100 files per batch and this project
   has 106 — upload in two batches (for example everything except `src/`
   first, then `src/`).
5. Commit with the message suggested above.

## 2. Deploy to Vercel (owner steps)

1. Sign in at [vercel.com](https://vercel.com) → **Add New → Project** →
   **Import** the Git repository `emmanuelgodwise-alt/Lamido-GRC` (after the
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
