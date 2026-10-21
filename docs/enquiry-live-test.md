# Enquiry Form — Edge Function Deployment & Live Test Plan

**Stage 4.** Complete this after [supabase-setup.md](supabase-setup.md)
(project created, migrations applied, first admin created, env vars set).

## A. Deploy the `create-enquiry` Edge Function (owner)

The function source is `supabase/functions/create-enquiry/index.ts`. It is
the ONLY writer of public enquiry rows; the database has no client insert
path.

### 1. Set the function secrets (never in the repository)

In a terminal with the Supabase CLI (`npm i -g supabase`) logged in
(`supabase login`), from the repository root:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
supabase secrets set RATE_LIMIT_SECRET=$(openssl rand -hex 32)
supabase secrets set ALLOWED_ORIGINS=https://your-live-domain.vercel.app
# optional: RATE_LIMIT_PER_HOUR (default 5)
```

- `SUPABASE_SERVICE_ROLE_KEY` — from Dashboard → Project Settings → API →
  `service_role`. **Never** place it in `.env*` files, Vercel, chat, or Git.
- `RATE_LIMIT_SECRET` — any long random string; it peppers the IP hashing.
- `ALLOWED_ORIGINS` — your live site origin(s), comma-separated. **Set this
  before launch.** While unset the function accepts any origin (development
  convenience only).

### 2. Link the project and deploy

```bash
supabase link --project-ref YOUR_PROJECT_REF   # ref is in Dashboard → Settings → General
supabase functions deploy create-enquiry
```

The function imports its validation from `src/lib/validation/enquiry.ts` —
the Supabase CLI bundles it automatically; no extra steps needed.

### 3. Confirm

```bash
supabase functions list
```

`create-enquiry` should show as deployed. (JWT verification stays ON — the
browser calls it with the public anon key.)

## B. Manual live test plan (owner)

Use test data only — never real personal data. Perform on the live site
after the env vars are set and the function deployed.

| # | Test | Steps | Expected result |
| - | ---- | ----- | ---------------- |
| 1 | **Valid submission** | Fill every required field, tick consent, wait a few seconds, submit | Green confirmation with a reference like `LLC-261021-XXXXXX`; form clears |
| 2 | **Record stored** | Dashboard → Table Editor → `enquiries` | New row with exactly the submitted data, `status = new` |
| 3 | **Invalid email** | Enter `not-an-email`, submit | Inline error under Work email; nothing sent |
| 4 | **Missing consent** | Leave consent unticked, submit | Inline consent error; nothing sent |
| 5 | **Overlong input** | Paste >160 chars into Subject | Inline length error; nothing sent |
| 6 | **Offline behavior** | DevTools → Network → Offline, submit | Honest offline message; nothing sent |
| 7 | **Network failure** | DevTools → Network → set to a throttled/blocked domain, submit | Honest network-failure message; input retained |
| 8 | **Rate limiting** | Submit 6+ valid enquiries within an hour from the same network | After the limit: honest "too many enquiries" message |
| 9 | **No emails promised** | Check the confirmation wording | Reference ID + dashboard review only — no email promise |
| 10 | **Admin visibility** | Sign in at `/admin` (after Stage 5) | The enquiry appears in the dashboard |

## C. Honest status notes

- Until this deployment is done, the public form shows an honest
  "not yet available" state — never a fake success.
- z.ai does not claim any remote deployment; the steps above are performed
  by the owner, and their results are verified by the tests in section B.
- Rate-limit records (hashed IPs) are pruned automatically after 7 days.
