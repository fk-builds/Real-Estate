-- ============================================================================
-- Manzil — ROW LEVEL SECURITY (canonical data-layer access control)
-- ============================================================================
-- Run AFTER auth.sql (which defines role helpers + app_metadata role stamping).
-- Re-runnable / idempotent (`drop policy if exists`).
--
-- The rules below are the single source of truth that the server-side guards
-- in lib/auth/authorize.ts mirror. The browser/anon key NEVER bypass these;
-- the service-role key DOES (it is superuser) and is therefore only ever used
-- by server-side code that FIRST re-validates the caller's role in authorize.ts.
--
--   Role        Read public site   Listings/Locations etc.   Leads        Agents
--   ─────────────────────────────────────────────────────────────────────────────
--   anon        published only     read-only (published)     ✗            read active
--   super_admin all                CRUD (any)                CRUD (any)   manage
--   admin       all                CRUD (any)                CRUD (any)   ✗
--   agent       published only     ✗ write                   own assigned ✗
--
-- Ownership model (for "agents manage only their assigned X"):
--   listings.owner_id   uuid NULL  → auth.users.uid of the responsible agent
--   leads.assigned_to   uuid NULL  → auth.users.uid the lead is staffed to
--   agents.user_id      uuid NULL  → auth.users.uid backing this agent profile
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Role helpers (idempotent; kept here so rls.sql can run standalone too)
-- ---------------------------------------------------------------------------
create or replace function public.current_role() returns text
  language sql stable security definer set search_path = public as $$
    select coalesce(auth.jwt() #>> '{app_metadata,role}', 'anon'); $$;

create or replace function public.is_super_admin() returns boolean
  language sql stable security definer set search_path = public as $$
    select public.current_role() = 'super_admin'; $$;

create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
    select public.current_role() in ('super_admin','admin'); $$;

create or replace function public.is_agent() returns boolean
  language sql stable security definer set search_path = public as $$
    select public.current_role() = 'agent'; $$;

create or replace function public.is_team() returns boolean
  language sql stable security definer set search_path = public as $$
    select public.is_admin() or public.is_agent(); $$;

-- A listing is "live for the public" when it is published and has a live status.
create or replace function public.is_live_listing(published boolean, status text) returns boolean
  language sql immutable as $$
    select published = true
       and coalesce(status,'') not in ('draft','archived','hidden','sold','rented','pending'); $$;

-- ---------------------------------------------------------------------------
-- 1. Enable RLS (and force it on for the postgres owner as a habit)
-- ---------------------------------------------------------------------------
alter table public.listings   force row level security;
alter table public.projects   force row level security;
alter table public.cities     force row level security;
alter table public.locations  force row level security;
alter table public.features   force row level security;
alter table public.cms        force row level security;
alter table public.agents     force row level security;
alter table public.leads      force row level security;

-- ---------------------------------------------------------------------------
-- 2. Grants (only these two go through RLS)
-- ---------------------------------------------------------------------------
grant select on public.listings, public.projects, public.cities, public.locations,
  public.features, public.cms, public.agents, public.leads to anon, authenticated;
grant insert, update, delete on public.listings, public.projects, public.cities,
  public.locations, public.features, public.cms, public.agents, public.leads
  to authenticated;

-- ===========================================================================
-- LISTINGS
-- ===========================================================================
-- Public: only published + live listings.
drop policy if exists "listings: anon/team public read" on public.listings;
create policy "listings: anon/team public read" on public.listings
  for select to anon, authenticated
  using (public.is_live_listing(published, status));

-- Super Admin / Admin manage every listing.
drop policy if exists "listings: admin CRUD" on public.listings;
create policy "listings: admin CRUD" on public.listings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Agents see the public site like anyone, but may not edit listings in bulk;
-- if a listing is assigned to them (owner_id = their uid) they may update it
-- (status/price) — not publish/unpublish global flags, not reassign ownership.
drop policy if exists "listings: agent update own assigned" on public.listings;
create policy "listings: agent update own assigned" on public.listings
  for update to authenticated
  using (public.is_agent() and owner_id = auth.uid())
  with check (public.is_agent() and owner_id = auth.uid() and published is not distinct from public.is_live_listing(published,status));

-- ===========================================================================
-- REFERENCE / CONTENT TABLES (cities, locations, features, projects, cms)
-- ===========================================================================
-- Everyone may read reference data (used to build filters / public pages).
drop policy if exists "reference: public read" on public.cities;
create policy "reference: public read" on public.cities for select to anon, authenticated using (true);
drop policy if exists "reference: public read2" on public.locations;
create policy "reference: public read2" on public.locations for select to anon, authenticated using (true);
drop policy if exists "reference: public read3" on public.features;
create policy "reference: public read3" on public.features for select to anon, authenticated using (true);
drop policy if exists "projects: public read" on public.projects;
create policy "projects: public read" on public.projects
  for select to anon, authenticated using (coalesce(is_featured,false) or coalesce(published,true) = true);
drop policy if exists "cms: no public read" on public.cms;
create policy "cms: no public read" on public.cms for select to anon using (false);

-- Content editors: super_admin/admin write; agents never write reference data.
drop policy if exists "reference: admin write cities" on public.cities;
create policy "reference: admin write cities" on public.cities for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "reference: admin write locations" on public.locations;
create policy "reference: admin write locations" on public.locations for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "reference: admin write features" on public.features;
create policy "reference: admin write features" on public.features for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "projects: admin CRUD" on public.projects;
create policy "projects: admin CRUD" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "cms: admin write" on public.cms;
create policy "cms: admin write" on public.cms for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- AGENTS
-- ===========================================================================
-- Public + any team member can read the agent directory (only active agents).
drop policy if exists "agents: public read active" on public.agents;
create policy "agents: public read active" on public.agents
  for select to anon, authenticated using (coalesce(active,true));

-- Only a Super Admin manages agent profiles (incl. assignment/roles).
drop policy if exists "agents: super_admin manage" on public.agents;
create policy "agents: super_admin manage" on public.agents
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ===========================================================================
-- LEADS
-- ===========================================================================
-- Leads are never public. Team reads: admin any; agent only assigned to them.
drop policy if exists "leads: no public read" on public.leads;
create policy "leads: no public read" on public.leads for select to anon using (false);

drop policy if exists "leads: read by role" on public.leads;
create policy "leads: read by role" on public.leads
  for select to authenticated
  using (public.is_admin() or (public.is_agent() and assigned_to = auth.uid()));

-- Anyone on the team may capture a lead (web enquiry, call log).
drop policy if exists "leads: team insert" on public.leads;
create policy "leads: team insert" on public.leads
  for insert to authenticated with check (public.is_team());

-- Update: admins any; agents only their assigned (may not re-assign away).
drop policy if exists "leads: update by role" on public.leads;
create policy "leads: update by role" on public.leads
  for update to authenticated
  using (public.is_admin() or (public.is_agent() and assigned_to = auth.uid()))
  with check (
    (public.is_admin() and true) or
    (public.is_agent() and assigned_to = auth.uid())
  );

-- Delete is a manager action only.
drop policy if exists "leads: delete admin" on public.leads;
create policy "leads: delete admin" on public.leads
  for delete to authenticated using (public.is_admin());

-- ===========================================================================
-- OPTIONAL — performance indexes backing the policies
-- ===========================================================================
create index if not exists listings_live_idx
  on public.listings (published, status);
create index if not exists listings_owner_idx
  on public.listings (owner_id);
create index if not exists leads_assigned_idx
  on public.leads (assigned_to);
create index if not exists agents_user_idx
  on public.agents (user_id);
-- ============================================================================
