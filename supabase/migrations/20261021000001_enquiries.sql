-- ============================================================================
-- Lamido, Lamido & Co. — Migration 0001: enquiries and supporting tables
-- ----------------------------------------------------------------------------
-- Creates the enquiry store plus the audit-events and rate-limit tables.
-- All timestamps are timezone-aware and stored in UTC.
-- RLS is ENABLED on every table in migration 0002 with DEFAULT DENY —
-- the only writer of enquiry rows is the trusted Edge Function (service
-- role), and the only readers are authorized admins.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- enquiries
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id            uuid primary key default gen_random_uuid(),
  reference_id  text not null unique
                check (char_length(reference_id) between 6 and 24),
  submitted_at  timestamptz not null default now(),
  -- Contact details (privacy-minimizing; no sensitive personal data)
  name          text not null check (char_length(name) between 1 and 120),
  email         text not null check (char_length(email) between 3 and 200),
  organization  text not null check (char_length(organization) between 1 and 200),
  role          text check (char_length(role) is null or char_length(role) between 1 and 120),
  country       text not null check (char_length(country) between 1 and 100),
  region        text check (char_length(region) is null or char_length(region) between 1 and 160),
  -- Classification (values are validated again by the Edge Function)
  sector        text not null check (char_length(sector) between 1 and 64),
  division      text not null check (char_length(division) between 1 and 64),
  subject       text not null check (char_length(subject) between 1 and 160),
  message       text not null check (char_length(message) between 1 and 5000),
  consent_at    timestamptz not null,
  -- Admin workflow (never settable by the public)
  status        text not null default 'new'
                check (status in ('new', 'in_review', 'contacted', 'closed')),
  admin_notes   text check (admin_notes is null or char_length(admin_notes) <= 10000),
  assigned_to   uuid references auth.users (id) on delete set null,
  updated_at    timestamptz not null default now()
);

comment on table public.enquiries is
  'Business enquiries submitted through the public website. Written only by the create-enquiry Edge Function (service role); read/updated only by authorized admins via RLS.';

create index if not exists enquiries_submitted_at_idx
  on public.enquiries (submitted_at desc);
create index if not exists enquiries_status_idx
  on public.enquiries (status);
create index if not exists enquiries_reference_id_idx
  on public.enquiries (reference_id);

-- ---------------------------------------------------------------------------
-- enquiry_events — lightweight, append-only activity log for status changes
-- (implementation kept intentionally simple; not a compliance-grade audit)
-- ---------------------------------------------------------------------------
create table if not exists public.enquiry_events (
  id          bigint generated always as identity primary key,
  enquiry_id  uuid not null references public.enquiries (id) on delete cascade,
  actor       uuid references auth.users (id) on delete set null,
  action      text not null check (char_length(action) between 1 and 64),
  detail      text check (detail is null or char_length(detail) <= 500),
  created_at  timestamptz not null default now()
);

create index if not exists enquiry_events_enquiry_id_idx
  on public.enquiry_events (enquiry_id, created_at);

-- ---------------------------------------------------------------------------
-- enquiry_rate_limits — anti-spam records used by the Edge Function.
-- Only the service role reads/writes this table; no RLS policies exist for
-- anon or authenticated users (RLS enabled in migration 0002 = default deny).
-- Raw IPs are never stored — only a keyed SHA-256 hash (see Stage 4 docs).
-- ---------------------------------------------------------------------------
create table if not exists public.enquiry_rate_limits (
  id          bigint generated always as identity primary key,
  ip_hash     text not null check (char_length(ip_hash) = 64),
  created_at  timestamptz not null default now()
);

create index if not exists enquiry_rate_limits_lookup_idx
  on public.enquiry_rate_limits (ip_hash, created_at);

-- ---------------------------------------------------------------------------
-- updated_at maintenance trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists enquiries_set_updated_at on public.enquiries;
create trigger enquiries_set_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();
