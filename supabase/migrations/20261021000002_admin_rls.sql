-- ============================================================================
-- Lamido, Lamido & Co. — Migration 0002: admin mechanism and Row Level Security
-- ----------------------------------------------------------------------------
-- SECURITY MODEL (project brief, enforced here at the database level):
--   * RLS is enabled on EVERY table. Default deny.
--   * Anonymous visitors can never read, list, update, or delete enquiries.
--   * There is NO insert policy on enquiries for anon/authenticated users —
--     enquiries are created only by the trusted Edge Function (service role).
--   * Only rows for authorized admins are readable/updatable, and only via
--     the is_admin() check against admin_users.
--   * A user can never write their own admin role: admin_users has no
--     insert/update/delete policies for clients; the first admin is created
--     by the owner in the Supabase SQL Editor (see docs/supabase-setup.md).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- admin_users — the admin-role mechanism, linked to Supabase Auth user ids
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  label       text check (label is null or char_length(label) <= 80),
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users (id) on delete set null
);

comment on table public.admin_users is
  'Authorized administrators. Rows are created only by the owner via the Supabase SQL Editor / dashboard. No client-facing write policies exist.';

-- ---------------------------------------------------------------------------
-- is_admin() — SECURITY DEFINER with pinned search_path and fully qualified
-- names (per the project brief's privilege-escalation requirements).
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS: admin_users
--   A signed-in user may read ONLY their own row (so the UI can show whether
--   they are an admin — the enquiries policies remain the real boundary).
--   No client insert/update/delete policies — admins are provisioned by the
--   owner in the dashboard/SQL editor only (the table owner bypasses RLS,
--   which is what makes the documented bootstrap possible).
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;

drop policy if exists "admin can read own row" on public.admin_users;
create policy "admin can read own row"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS: enquiries — default deny, admin read/update only, NO client insert
-- ---------------------------------------------------------------------------
alter table public.enquiries enable row level security;

-- NOTE: plain `enable` (not `force`) is deliberate. anon/authenticated face
-- the full default-deny policies above; the table owner (owner maintenance
-- via the SQL editor) and the service role (Edge Function) bypass RLS,
-- which is exactly the documented trust model.

drop policy if exists "admins can read enquiries" on public.enquiries;
create policy "admins can read enquiries"
  on public.enquiries
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can update enquiries" on public.enquiries;
create policy "admins can update enquiries"
  on public.enquiries
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Deliberately NO policies for: anon select/insert/update/delete,
-- authenticated insert/delete. Anonymous and non-admin clients can do
-- nothing; enquiries are inserted by the Edge Function using the service
-- role, which bypasses RLS.

-- ---------------------------------------------------------------------------
-- RLS: enquiry_events — admin read only. Rows are written by the
-- status-change trigger below (SECURITY DEFINER), never directly by clients.
-- ---------------------------------------------------------------------------
alter table public.enquiry_events enable row level security;

drop policy if exists "admins can read enquiry events" on public.enquiry_events;
create policy "admins can read enquiry events"
  on public.enquiry_events
  for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Status-change trigger: records an event row whenever an admin changes the
-- enquiry status (basic activity tracking; deliberately simple).
-- ---------------------------------------------------------------------------
create or replace function public.record_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.enquiry_events (enquiry_id, actor, action, detail)
    values (new.id, auth.uid(), 'status_change',
            old.status || ' -> ' || new.status);
  end if;
  return new;
end;
$$;

revoke all on function public.record_status_change() from public;

drop trigger if exists enquiries_record_status_change on public.enquiries;
create trigger enquiries_record_status_change
  after update on public.enquiries
  for each row execute function public.record_status_change();

-- ---------------------------------------------------------------------------
-- RLS: enquiry_rate_limits — locked to the service role only.
-- RLS enabled with NO policies at all: anon and authenticated get nothing.
-- ---------------------------------------------------------------------------
alter table public.enquiry_rate_limits enable row level security;
-- Intentionally no policies: default deny for every non-owner, non-service role.
