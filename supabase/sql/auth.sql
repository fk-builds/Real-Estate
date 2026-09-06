-- ============================================================================
-- Manzil — Supabase Auth + Row Level Security provisioning
-- ============================================================================
-- Run in the Supabase SQL editor (or `supabase db push`) on the production DB.
--
-- Roles are stored on `auth.users.app_metadata.role` and are one of:
--     'super_admin' | 'admin' | 'agent'
-- They are stamped by an admin using the Supabase dashboard, or via SQL below.
--
-- Security model (defence in depth):
--   1. Route-level RBAC in Next.js middleware (lib/auth/roles.ts).
--   2. Data-level RBAC enforced HERE with RLS so no API can bypass it.
--   3. The anon key is the only key the browser/edge ever sees. The
--      service-role key (SUPABASE_SERVICE_ROLE_KEY) is used only in server-side
--      code and BYPASSES RLS — never expose it to a client component.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Role helper functions (security definer → stable under RLS)
-- ---------------------------------------------------------------------------
create or replace function public.current_role() returns text
  language sql stable security definer
  set search_path = public as $$
    select coalesce(
      nullif(auth.jwt() ->> 'role', ''),          -- if we add a DB-level role
      coalesce(auth.jwt() #>> '{app_metadata,role}', 'anon')
    );
$$;

create or replace function public.is_role(needle text) returns boolean
  language sql stable security definer
  set search_path = public as $$
    select public.current_role() = needle;
$$;

-- Convenience predicates used by policies.
create or replace function public.is_super_admin() returns boolean
  language sql stable security definer set search_path = public as $$
    select public.is_role('super_admin'); $$;

create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
    select public.is_role('super_admin') or public.is_role('admin'); $$;

create or replace function public.is_agent() returns boolean
  language sql stable security definer set search_path = public as $$
    select public.is_role('agent'); $$;

create or replace function public.is_team() returns boolean
  language sql stable security definer set search_path = public as $$
    select public.is_admin() or public.is_agent(); $$;

-- ---------------------------------------------------------------------------
-- 2. Enable RLS on every content table (idempotent)
-- ---------------------------------------------------------------------------
alter table public.listings   enable row level security;
alter table public.projects   enable row level security;
alter table public.cities     enable row level security;
alter table public.locations  enable row level security;
alter table public.features   enable row level security;
alter table public.cms        enable row level security;
alter table public.agents     enable row level security;
alter table public.leads      enable row level security;

-- ---------------------------------------------------------------------------
-- 3. Grants — anon (browser, public site) + authenticated (team members)
--    After the seed/backfill step below tables are owned by postgres (superuser)
--    which bypasses RLS; service role also bypasses. Only these two roles must
--    go through RLS.
-- ---------------------------------------------------------------------------
grant select on public.listings, public.projects, public.cities,
  public.locations, public.features, public.cms, public.agents, public.leads
  to anon, authenticated;
grant insert, update, delete on public.listings, public.projects, public.cities,
  public.locations, public.features, public.cms, public.agents, public.leads
  to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Public site reads — everyone (anonymous visitors) may read approved
--    content. `status`/`published`/`approved` act as the soft-publication flag.
-- ---------------------------------------------------------------------------
drop policy if exists "public read listings" on public.listings;
create policy "public read listings" on public.listings
  for select using (
    public.is_team() or coalesce(status, '') in ('available','active','')
    or (status is not null and lower(status) not in ('draft','archived','sold','rented','hidden'))
  );

drop policy if exists "public read projects" on public.projects;
create policy "public read projects" on public.projects
  for select using (public.is_team() or coalesce(published, true));

drop policy if exists "public read reference tables" on public.cities;
create policy "public read reference tables" on public.cities
  for select using (true);

drop policy if exists "public read reference tables2" on public.locations;
create policy "public read reference tables2" on public.locations
  for select using (true);

drop policy if exists "public read features" on public.features;
create policy "public read features" on public.features
  for select using (true);

drop policy if exists "public read agents" on public.agents;
create policy "public read agents" on public.agents
  for select using (coalesce(published, true));

-- CMS + leads are never public.
drop policy if exists "public read cms" on public.cms;
create policy "public read cms" on public.cms for select using (false);
drop policy if exists "public read leads" on public.leads;
create policy "public read leads" on public.leads for select using (false);

-- ---------------------------------------------------------------------------
-- 5. Write access by role
--    super_admin  → full control of everything
--    admin        → full control except agent management (managed by super_admin)
--    agent        → manage their own leads only
-- ---------------------------------------------------------------------------
-- Content editors: super_admin & admin (agents are read-only here).
drop policy if exists "team write content" on public.listings;
create policy "team write content" on public.listings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team write projects" on public.projects;
create policy "team write projects" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team write cities" on public.cities;
create policy "team write cities" on public.cities
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team write locations" on public.locations;
create policy "team write locations" on public.locations
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team write features" on public.features;
create policy "team write features" on public.features
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team write cms" on public.cms;
create policy "team write cms" on public.cms
  for all using (public.is_admin()) with check (public.is_admin());

-- Agents directory — only a super_admin may manage agents.
drop policy if exists "read agents team" on public.agents;
create policy "read agents team" on public.agents
  for select using (public.is_team());

drop policy if exists "manage agents super_admin only" on public.agents;
create policy "manage agents super_admin only" on public.agents
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- Leads — super_admin & admin see all; an agent only sees leads assigned to them
-- (stored as agent_id on the lead). Everyone on the team may insert a lead.
drop policy if exists "read leads by role" on public.leads;
create policy "read leads by role" on public.leads
  for select using (
    public.is_admin() or
    (public.is_agent() and auth.uid() is not null and agent_id = auth.uid())
  );

drop policy if exists "insert leads team" on public.leads;
create policy "insert leads team" on public.leads
  for insert with check (public.is_team());

drop policy if exists "update leads role" on public.leads;
create policy "update leads role" on public.leads
  for update using (
    public.is_admin() or
    (public.is_agent() and auth.uid() is not null and agent_id = auth.uid())
  ) with check (public.is_admin() or public.is_agent());

drop policy if exists "delete leads admin only" on public.leads;
create policy "delete leads admin only" on public.leads
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. Backfill roles on existing users (super_admin grants themselves).
--    First create your own account in the UI, then run:
-- ---------------------------------------------------------------------------
-- update auth.users
--    set app_metadata = jsonb_set(
--          coalesce(app_metadata, '{}'), '{role}', '"super_admin"')
--  where email = 'you@manzil.pk';
--
-- -- Grant an admin / agent:
-- update auth.users
--    set app_metadata = jsonb_set(
--          coalesce(app_metadata, '{}'), '{role}', '"admin"')
--  where email = 'editor@manzil.pk';
-- ============================================================================
