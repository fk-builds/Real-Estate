-- ============================================================================
-- MANZIL · Supabase RUNTIME objects consumed by the Next.js app
-- Run AFTER database-schema.sql (the DDL). This file creates the search view +
-- the `manzil_search` RPC that SupabaseStore.search() calls, and guarantees
-- the few extra columns the read-layer expects on `projects`.
-- ============================================================================

-- --- 1. Guarantee read-layer columns on projects --------------------------
alter table projects add column if not exists location text;
alter table projects add column if not exists units text;
-- derived "new listing" flag used by the read model for badges/newest sort
alter table listings add column if not exists is_new boolean not null default false;
-- --- 1b. Property / plot-number search support ---------------------------
-- Visitors search "Plot 123", "house 22-B", "apt 2103" etc. Property numbers
-- live on `listings.plot_number`; their location (project/phase/sector/block)
-- is resolved through the listing's location foreign keys. We optimise the
-- lookup with (a) a normalised number column + btree index, and (b) a pg_trgm
-- GIN index for substring/fuzzy matches, plus a composite index over the
-- location keys so resolving Project → Phase → Sector → Block stays cheap.
create extension if not exists pg_trgm;
alter table listings add column if not exists plot_number text;
alter table listings add column if not exists plot_number_norm text;
-- normalise once: drop designators/punctuation ("House 22-B" → "22b")
update listings
   set plot_number_norm = lower(regexp_replace(coalesce(plot_number,''), '[^a-z0-9]', '', 'g'))
 where plot_number_norm is null or plot_number_norm = '';
-- indexes
create index if not exists listings_plot_number_btree
  on listings (plot_number_norm);
create index if not exists listings_plot_number_trgm
  on listings using gin (plot_number gin_trgm_ops);
create index if not exists listings_location_lookup
  on listings (project_id, area_id, subarea_id)
  where plot_number is not null and plot_number <> '';

-- --- 2. Read model: flatten listings for search + detail ----------------
-- Keep it a view (no denormalised storage to maintain). Postgres FTS uses the
-- generated `fts` tsvector column on listings.
drop view if exists v_listing_search;
create view v_listing_search as
select
  l.id,
  l.slug,
  coalesce(l.headline, l.title) as title,
  l.headline,
  l.description,
  l.purpose,
  l.kind,
  l.status,
  l.is_featured,
  l.verified,
  (l.published_at is not null and l.status in ('available','under_offer')) as is_active,
  l.is_new,
  l.views,
  l.price,
  l.price_period,
  l.price_display,
  l.area_raw,
  l.beds,
  l.baths,
  -- tag: derive one of sale/rent/new/hot for UI badge
  case
    when array_position(coalesce(l.tags,'{}'),'featured') is not null then 'featured'
    when array_position(coalesce(l.tags,'{}'),'hot') is not null then 'hot'
    when array_position(coalesce(l.tags,'{}'),'new') is not null then 'new'
    when l.purpose = 'rent' then 'rent'
    else 'sale'
  end as tag,
  c.slug as city_slug,
  c.name  as city_name,
  a.name  as area_label,
  sa.name as subarea_label,
  pr.slug as project_slug,
  pr.name as project_name,
  l.address,
  l.lat, l.lng,
  l.plot_number,
  l.plot_number_norm,
  -- primary cover + ordered gallery + feature labels
  (select url from listing_media m where m.listing_id = l.id and m.is_primary limit 1) as cover_image,
  coalesce((select array_agg(m.url order by m.sort) from listing_media m where m.listing_id=l.id and m.kind='photo'), '{}') as gallery,
  coalesce(
    (select array_agg(pf.label) from unnest(l.features) f(id)
       join property_features pf on pf.id = f.id), '{}'
  ) as features,
  coalesce(
    (select array_agg(pf.key) from unnest(l.features) f(id)
       join property_features pf on pf.id = f.id), '{}'
  ) as feature_keys,
  -- ordered media catalogue (photos/floorplans/documents/video/virtual tour)
  property_media_payload(l.id) as media,
  case
    when l.created_at >= now() - interval '3 days' then 'Today'
    when l.created_at >= now() - interval '7 days' then 'This week'
    else to_char(l.published_at,'Mon DD, YYYY')
  end as posted_label,
  l.fts
from listings l
  join cities c  on c.id  = l.city_id
  join areas  a  on a.id  = l.area_id
  left join areas sa  on sa.id = l.subarea_id
  left join projects pr on pr.id = l.project_id;

-- --- 3. Search RPC (PostgreSQL full-text) -------------------------------
-- Parameters are nullable; PostgREST maps a json object to these.
create or replace function manzil_search(
  p_filters jsonb,
  p_sort     text default 'newest',
  p_page     int  default 1,
  p_page_size int default 12
) returns setof v_listing_search language sql stable as $$
  with base as (
    select v.*
    from v_listing_search v
    where v.is_active
      and (p_filters->>'purpose' is null or v.purpose = (p_filters->>'purpose')::property_purpose)
      and (p_filters->>'kind'    is null or v.kind    = (p_filters->>'kind')::property_kind)
      and (p_filters->>'city'    is null or v.city_slug = p_filters->>'city')
      and (p_filters->>'q'       is null or v.fts @@ websearch_to_tsquery('english', p_filters->>'q')
            or v.title ilike '%'||(p_filters->>'q')||'%'
            or v.plot_number_norm like '%'||lower(regexp_replace(p_filters->>'q','[^a-z0-9]','','g'))||'%')
      and (p_filters->>'min_price' is null or v.price >= (p_filters->>'min_price')::numeric)
      and (p_filters->>'max_price' is null or v.price <= (p_filters->>'max_price')::numeric)
      and (p_filters->>'beds' is null or v.beds >= (p_filters->>'beds')::int)
      and (p_filters->>'baths' is null or v.baths >= (p_filters->>'baths')::int)
      and (p_filters->>'area' is null or v.area_label ilike '%'||(p_filters->>'area')||'%'
            or coalesce(v.subarea_label,'') ilike '%'||(p_filters->>'area')||'%')
      and (p_filters->>'project' is null or v.project_name ilike '%'||(p_filters->>'project')||'%'
            or v.project_slug ilike '%'||(p_filters->>'project')||'%')
      and (p_filters->>'feature' is null
            or array_position(v.feature_keys, p_filters->>'feature') is not null)
      and (p_filters->>'verified' is null or v.verified)
      and (p_filters->>'featured' is null or v.is_featured)
  )
  select b.*
  from base b
  order by
    case p_sort
      when 'price_asc'  then b.price
      when 'price_desc' then b.price * -1
      else 0
    end asc,
    case when p_sort='price_desc' then 0 else b.price end desc nulls last,
    case when p_sort='views' then b.views else 0 end desc,
    case when p_sort='newest' or p_sort is null then extract(epoch from coalesce(b.published_at,now())) else 0 end desc
  limit greatest(1,p_page_size)
  offset greatest(0,(p_page-1)*p_page_size);
$$;

-- --- 4. total-count helper for the RPC result ----------------------------
-- (SupabaseStore reads row count from `items.length` on page<size, but a
--  dedicated count keeps pagination exact.)
create or replace function manzil_search_count(p_filters jsonb)
returns int language sql stable as $$
  select count(*)::int
  from v_listing_search v
  where v.is_active
    and (p_filters->>'purpose' is null or v.purpose = (p_filters->>'purpose')::property_purpose)
    and (p_filters->>'kind'    is null or v.kind    = (p_filters->>'kind')::property_kind)
    and (p_filters->>'city'    is null or v.city_slug = p_filters->>'city')
    and (p_filters->>'baths' is null or v.baths >= (p_filters->>'baths')::int)
    and (p_filters->>'area' is null or v.area_label ilike '%'||(p_filters->>'area')||'%'
          or coalesce(v.subarea_label,'') ilike '%'||(p_filters->>'area')||'%')
    and (p_filters->>'project' is null or v.project_name ilike '%'||(p_filters->>'project')||'%'
          or v.project_slug ilike '%'||(p_filters->>'project')||'%')
    and (p_filters->>'feature' is null
          or array_position(v.feature_keys, p_filters->>'feature') is not null)
    and (p_filters->>'verified' is null or v.verified)
    and (p_filters->>'featured' is null or v.is_featured);
$$;

-- --- 5. Media helper: get a stable public URL for any media row ----------
-- In the "local / no backend" dev mode the app returns placeholder paths, so
-- this is only relevant once uploaded media exists.
create or replace function media_public_url(m listing_media) returns text
language sql stable as $$
  select case when m.url like 'http%' then m.url
              else '/storage/v1/object/public/manzil/'||m.url end;
$$;

-- --- 6. Storage folders (create empty marker objects at first run) ------
-- Optional. Storage is configured from the dashboard; the folder convention the
-- app writes to is:  <kind>s/<entity-id>/<file>  e.g.  listings/12/01.jpg
--   kinds: listings | projects | agents | floorplans | documents | videos | logos | banners
