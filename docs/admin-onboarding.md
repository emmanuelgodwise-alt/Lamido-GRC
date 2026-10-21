# Admin Onboarding — Lamido, Lamido & Co. Enquiry Dashboard

**Stage 5.** The internal dashboard lives at **`/admin`** on the deployed
site. It is protected by Supabase Auth and, authoritatively, by database
Row Level Security (Stage 3): even if someone reaches the URL, an
unauthorized account can see and change nothing.

## Security model in one paragraph

There is **no public registration** — accounts and admin rights are
provisioned manually by the owner in the Supabase dashboard. The browser
only ever holds the public anon key; every dashboard query runs with the
signed-in user's session and is filtered by the database itself. Client
routing is a convenience; RLS is the boundary. The service worker never
caches `/admin`, the page is `noindex`, and it is excluded from the sitemap
and disallowed in `robots.txt`.

## First-time setup (owner — once)

1. Complete [supabase-setup.md](supabase-setup.md) sections 1–4 (project,
   migrations, first admin, RLS verification).
2. Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   are set in your hosting environment (Vercel → Project → Settings →
   Environment Variables) and redeploy.

## Creating additional administrators (owner)

1. Supabase dashboard → **Authentication → Users → Add user** — email +
   strong password, **Auto Confirm User** enabled.
2. Copy the user's **UID**.
3. SQL Editor:

   ```sql
   insert into public.admin_users (user_id, label)
   values ('THE-NEW-UID', 'Administrator name');
   ```

4. Share the credentials with the administrator through a secure channel —
   **never email or chat the password**. Ask them to change it after first
   sign-in (see Passwords below).

Removing an administrator: delete the row from `admin_users` in the Table
Editor. Their account can still sign in to Supabase Auth but the dashboard
will show "Not an administrator" and all data queries fail closed.

## Signing in (administrator)

1. Open `https://your-domain/admin` (add it to your bookmarks on phone and
   desktop — the site is an installable PWA).
2. Enter the administrator email + password.
3. The dashboard loads: summary counts, searchable and filterable enquiry
   list, detail view with status changes, internal notes, activity history,
   and safe CSV export.

## Passwords

- **Forgot password?** Use "Forgot the administrator password?" on the
  sign-in panel. Supabase sends a reset email using its built-in email
  sender (free-tier sending limits apply — if the email is slow to arrive,
  wait a few minutes and check spam).
- **Owner-initiated reset:** Authentication → Users → the user → **Send
  magic link / reset** or set a new password directly.
- Administrators must **never share credentials**. One account per person.

## Using the dashboard responsibly

- Status changes (`new → in review → contacted → closed`) are reversible
  and recorded in the Activity list.
- Internal notes are private to authorized administrators; they are never
  shown on the public site and are excluded from CSV exports.
- CSV export covers the current filter (up to 500 rows), is
  formula-injection-safe, and generates locally in your browser — no
  public download URL is ever created.
- There is deliberately no delete workflow — statuses and notes keep the
  record auditable. If a record must be removed for legal reasons, the
  owner can do it in the Supabase Table Editor (bypasses RLS) and should
  document why.
- Do not paste enquiry personal data into third-party analytics or logs.

## Troubleshooting

| Symptom | Likely cause / fix |
| ------- | ------------------ |
| "Administration area unavailable" | Site env vars missing — see First-time setup step 2 |
| "Not an administrator" | Signed-in account has no `admin_users` row — see Creating administrators |
| Sign-in fails | Wrong credentials, or the user was created without Auto Confirm |
| Empty list but data exists in Table Editor | RLS working as designed — the account is not an admin |
| "session has expired" message | Expected after sign-out/expiry — sign in again |
