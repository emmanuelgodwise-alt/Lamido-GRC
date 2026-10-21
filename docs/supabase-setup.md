# Supabase Setup — Lamido, Lamido & Co. Enquiry Backend

**Checked: 21 October 2026.** Supabase plans and quotas change — re-verify
against the links below before launch.

This guide takes the repository from "database code ready" to "live, secured
backend". Everything can be done from the Supabase dashboard in a browser —
no CLI required. Time estimate: 20–30 minutes.

## What you are setting up

| Piece | What it is | Where it lives |
| ----- | ---------- | -------------- |
| `enquiries` table | Stores every website enquiry | `supabase/migrations/20261021000001_enquiries.sql` |
| `admin_users` + RLS | Admin-role mechanism + database security | `supabase/migrations/20261021000002_admin_rls.sql` |
| Row Level Security | Default-deny; only admins read/update; **no** public write path | Same migration files |
| `enquiry_events` | Lightweight log of status changes | Migration 0001 |
| `enquiry_rate_limits` | Anti-spam records for the Edge Function (Stage 4) | Migration 0001 |

The browser only ever receives the **Project URL** and **anon key** — both are
public-by-design values. The **service-role key never leaves Supabase**: it is
set as an Edge Function secret in Stage 4.

## 1. Create the project (owner, ~5 minutes)

1. Sign in at <https://supabase.com> (a free account is fine).
2. **New project** → Organization (create one if prompted) →
   Name: `lamido-lamido-co` (or similar) → choose a region close to your
   users, e.g. `EU (Frankfurt)` → set a strong database password and store it
   safely → **Create new project**.
3. Wait 1–2 minutes for provisioning.

Free-plan facts to be aware of (re-check on the official pages):
- <https://supabase.com/pricing> and
  <https://supabase.com/docs/guides/platform/billing-on-supabase>
- **Projects pause after ~1 week of inactivity** on the free plan. A paused
  project can be restored from the dashboard; data is retained.
- Free quotas are comfortably sufficient for a small lead-generation MVP.

## 2. Apply the migrations (owner, ~5 minutes)

1. In your Supabase dashboard, open **SQL Editor**.
2. Open `supabase/migrations/20261021000001_enquiries.sql` from this
   repository, copy its entire contents, paste into the SQL Editor, and
   **Run**. It should report success.
3. Repeat with `supabase/migrations/20261021000002_admin_rls.sql`.
4. Confirm in **Table Editor** that `enquiries`, `admin_users`,
   `enquiry_events`, and `enquiry_rate_limits` now exist (they will be empty).

Migrations are idempotent-friendly but designed to run once each, in order.

## 3. Create the first admin user (owner, ~5 minutes)

There is **no public sign-up** anywhere in this product — the first admin is
created manually:

1. Dashboard → **Authentication → Users → Add user → Create new user**.
2. Enter the administrator's email and a strong password. Enable
   **Auto Confirm User**. Save.
3. Copy the new user's **UID** (shown in the user list).
4. SQL Editor → run:

   ```sql
   insert into public.admin_users (user_id, label)
   values ('PASTE-THE-UID-HERE', 'Owner / Administrator');
   ```

5. Sign-in for the admin dashboard (Stage 5) will use exactly this email and
   password. Do not share them; each additional admin is added the same way.

## 4. Verify the security model (owner, ~10 minutes)

Open `supabase/verify-rls.sql` in this repository and run its numbered blocks
in the SQL Editor one at a time, comparing each result with the `EXPECT`
lines. This proves: anonymous visitors cannot read or create enquiries;
non-admin users cannot read them or self-promote; only the authorized admin
can.

## 5. Connect the website (owner, ~5 minutes)

The site needs two values — both safe to place in browser environment
variables by design:

1. Dashboard → **Project Settings → API**:
   - **Project URL** — e.g. `https://xxxxx.supabase.co`
   - **anon public** key — the publishable key
2. Locally: put both into `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
   ```

3. On Vercel: Project → **Settings → Environment Variables** → add the same
   two values (Production + Preview), then **Redeploy**.

**Never** place the `service_role` key in `.env.local`, Vercel, chat
messages, or the repository. It is only ever set as an Edge Function secret
(Stage 4 guide).

## 6. What is deliberately NOT configured yet

- **Edge Function (`create-enquiry`)** — written in Stage 4, deployed in the
  Stage 4 guide. Until it is deployed, the public form cannot submit (it
  shows an honest "not available" state — never a fake success).
- **Email notifications** — intentionally not part of the $0 build. Admins
  read enquiries in the Stage 5 dashboard.
- **Public sign-up / "make me admin" flows** — do not exist, by design.

## Applying future migrations

When later stages add migrations, apply them the same way (SQL Editor, in
filename order, one at a time). The migration files are the source of truth —
never click-create tables by hand if a migration file exists for them.
