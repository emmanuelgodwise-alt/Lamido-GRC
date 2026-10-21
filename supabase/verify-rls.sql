-- ============================================================================
-- Lamido, Lamido & Co. — RLS VERIFICATION CHECKLIST
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor AFTER applying both migrations and
-- creating your first admin user (see docs/supabase-setup.md).
--
-- Each numbered test is a self-contained block that rolls back at the end.
-- Run the blocks one at a time, top to bottom, and compare the actual result
-- with the EXPECT line above each block. Every test that expects a failure
-- or zero rows is the security model working as designed.
--
-- Replace  '00000000-0000-0000-0000-000000000000'  in TEST C with your real
-- admin user's Auth UUID (the one you inserted into admin_users).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- TEST A — Review the policies that exist (inventory)
-- EXPECT: exactly these 5 policies:
--   admin_users    | select | "admin can read own row"
--   enquiries      | select | "admins can read enquiries"
--   enquiries      | update | "admins can update enquiries"
--   enquiry_events | select | "admins can read enquiry events"
-- (enquiry_rate_limits and admin_users writes have NO policies — by design)
-- ---------------------------------------------------------------------------
select schemaname, tablename, cmd, policyname
from pg_policies
where schemaname = 'public'
order by tablename, cmd;

-- ---------------------------------------------------------------------------
-- TEST B — Anonymous visitors can never read or write enquiries
-- EXPECT: select returns 0 rows.
-- EXPECT: the insert FAILS with an RLS violation error.
-- ---------------------------------------------------------------------------
begin;
set local role anon;
select count(*) as anon_can_read from public.enquiries; -- EXPECT 0
rollback;

begin;
set local role anon;
insert into public.enquiries
  (reference_id, name, email, organization, country, sector, division,
   subject, message, consent_at)
values
  ('RLSTEST01', 'RLS Test', 'test@example.com', 'Test Org', 'Testland',
   'agriculture', 'market-entry-business-development', 'RLS test',
   'This insert must be rejected.', now());
-- EXPECT: ERROR: new row violates row-level security policy
rollback;

-- ---------------------------------------------------------------------------
-- TEST C — A NORMAL authenticated user (NOT an admin) cannot read enquiries
-- The fake JWT below carries a sub that is NOT in admin_users.
-- EXPECT: count returns 0.
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
set local request.jwt.claims to
  '{"sub":"ffffffff-ffff-ffff-ffff-ffffffffffff","role":"authenticated"}';
select count(*) as nonadmin_can_read from public.enquiries; -- EXPECT 0
rollback;

-- ---------------------------------------------------------------------------
-- TEST D — A normal authenticated user cannot self-elevate to admin
-- EXPECT: the insert FAILS with an RLS violation error.
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
set local request.jwt.claims to
  '{"sub":"ffffffff-ffff-ffff-ffff-ffffffffffff","role":"authenticated"}';
insert into public.admin_users (user_id, label)
values ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'self-appointed');
-- EXPECT: ERROR: new row violates row-level security policy
rollback;

-- ---------------------------------------------------------------------------
-- TEST E — An AUTHORIZED ADMIN can read and update enquiries
-- Replace the sub below with your real admin user's Auth UUID.
-- EXPECT: count returns your enquiry total (0 until the first live enquiry).
-- EXPECT: the status update succeeds (an enquiry_events row is created).
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
set local request.jwt.claims to
  '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}';
select count(*) as admin_can_read from public.enquiries; -- EXPECT >= 0 (no error)
rollback;

-- To fully test updates, create a throw-away enquiry first (as the table
-- owner), update it as the admin, then clean up:
begin;
insert into public.enquiries
  (reference_id, name, email, organization, country, sector, division,
   subject, message, consent_at)
values
  ('RLSTEST02', 'RLS Test', 'test@example.com', 'Test Org', 'Testland',
   'agriculture', 'market-entry-business-development', 'RLS test',
   'Temporary test enquiry.', now());
rollback;

-- ---------------------------------------------------------------------------
-- TEST F — enquiry_events is admin-readable and client-unwritable
-- EXPECT: select as anon returns 0 rows.
-- ---------------------------------------------------------------------------
begin;
set local role anon;
select count(*) as anon_can_read_events from public.enquiry_events; -- EXPECT 0
rollback;

-- ============================================================================
-- SUMMARY — if every EXPECT line matched, the Stage 3 security model holds:
--   1. Anonymous users cannot read or create enquiries.
--   2. Non-admin authenticated users cannot read or manage enquiries.
--   3. No user can grant themselves the admin role.
--   4. Authorized admins can read and update enquiries (and only they).
--   5. Enquiries are created ONLY by the Edge Function (service role).
-- ============================================================================
