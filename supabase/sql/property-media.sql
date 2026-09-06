-- ============================================================================
-- MANZIL · PROPERTY MEDIA (canonical DDL)
-- ----------------------------------------------------------------------------
-- A proper, relational media table so every property can carry MANY assets of
-- several kinds with full metadata — not a hard-coded array of image strings.
--
--   kind         photo | floorplan | document | video | virtual_tour
--   ref          storage path OR external URL (http/https)
--   sort         explicit ordering (the UI renders by this, not insertion)
--   is_primary   cover / poster (exactly ONE per property, enforced below)
--   caption      short human caption under the asset
--   alt          accessibility / SEO alt text (images)
--   name         original file name (documents/downloads)
--   width/height intrinsic pixels (drives <Image> dims => no layout shift)
--   content_type mime type · size_bytes
--   thumb_ref    poster image for video / social card (optional)
--
-- Run this AFTER database-schema.sql. Mirrors the TypeScript `MediaItem` shape
-- in lib/data/media.ts so the read-layer maps 1:1 to app objects.
-- ============================================================================

-- --- 1. Kind enum ---------------------------------------------------------
do $$ begin
  create type media_kind as enum ('photo','floorplan','document','video','virtual_tour');
exception when duplicate_object then null; end $$;

-- --- 2. Table ------------------------------------------------------------
create table if not exists property_media (
  id           uuid primary key default gen_random_uuid(),
  -- parent property (the app's "listing"). Cascade deletes tidy up media.
  listing_id   uuid not null references listings(id) on delete cascade,
  kind         media_kind not null default 'photo',
  -- storage ref (bucket path) or a full external http(s) URL
  ref          text not null,
  is_primary   boolean not null default false,
  sort         integer not null default 0,
  caption      text,
  alt          text,
  name         text,
  width        integer,
  height       integer,
  content_type text,
  size_bytes   bigint,
  thumb_ref    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ordering bucket is unique per property (reorder = rewrite sorts)
create unique index if not exists uq_property_media_sort
  on property_media(listing_id, kind, sort);
-- only ONE primary/cover asset per property
create unique index if not exists uq_property_media_primary
  on property_media(listing_id) where is_primary;
create index if not exists ix_property_media_listing on property_media(listing_id, kind, sort);

-- updated_at bump
create or replace function property_media_set_updated() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists trg_property_media_updated on property_media;
create trigger trg_property_media_updated
  before update on property_media for each row execute function property_media_set_updated();

-- --- 3. Row-level security ------------------------------------------------
-- Public can READ media for any live property; only staff/auth can WRITE it.
alter table property_media enable row level security;
drop policy if exists property_media_select on property_media;
create policy property_media_select on property_media
  for select using (true);
drop policy if exists property_media_staff_all on property_media;
create policy property_media_staff_all on property_media
  for all to authenticated using (exists (
    select 1 from user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('admin','staff')
  ));

-- --- 4. Storage bucket conventions -----------------------------------------
-- Public bucket `manzil`. Folders the app writes to:
--    photos/     ->  photos/<listing-id>/<file>          (images)
--    floorplans/ ->  floorplans/<listing-id>/<file>       (images/PDF)
--    documents/  ->  documents/<listing-id>/<file>        (PDFs etc.)
-- Videos / virtual tours are usually external URLs stored in `ref` directly.
-- Objects are optimized upstream (transform on upload) and served via Next.js
-- <Image> (AVIF/WebP + responsive srcset) — see lib/services/media-service.ts.

-- --- 5. Payload helper: one row of the media read-model per property -------
-- Aggregates ordered media as JSON so the store can fetch everything in a
-- single sub-select (avoids N+1 in the listings view).
create or replace function property_media_payload(p_listing_id uuid)
returns jsonb language sql stable as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',          m.id,
      'kind',        m.kind::text,
      'ref',         m.ref,
      'url',         case when m.ref like 'http%' then m.ref
                          else '/storage/v1/object/public/manzil/'||m.ref end,
      'thumb',       case when m.thumb_ref like 'http%' then m.thumb_ref
                          else '/storage/v1/object/public/manzil/'||m.thumb_ref end,
      'isCover',     m.is_primary,
      'sort',        m.sort,
      'caption',     m.caption,
      'alt',         m.alt,
      'name',        m.name,
      'width',       m.width,
      'height',      m.height,
      'contentType', m.content_type,
      'size',        m.size_bytes
    ) order by m.kind, m.sort
  ), '[]'::jsonb)
  from property_media m where m.listing_id = p_listing_id;
$$;

-- Convenience accessors for a single listing by slug.
create or replace function property_media_by_slug(p_slug text)
returns setof property_media language sql stable as $$
  select m.* from listings l
    join property_media m on m.listing_id = l.id
    where l.slug = p_slug order by m.kind, m.sort;
$$;
