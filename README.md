# Manzil · Premium Pakistan Real-Estate Platform

Production-ready **Next.js 15 + Supabase + TypeScript + Tailwind** codebase for a premium property agency + marketplace serving the Pakistani market (houses, plots, apartments, new developments).

> **Brand:** Manzil (منزل = "home/destination") · deep-emerald + gold · editorial serif × utility sans.
> **Position:** verified listings + senior advisors + end-to-end legal support.

---

## ✨ Status & how to run it right now

The app boots in **local mode** (seeded sample data, no backend required) so it runs end-to-end immediately:

```bash
cd manzil-app
npm install
npm run dev        # http://localhost:3000
```

To run the **live Supabase** path instead, copy `.env.example` → `.env.local`, fill in your keys, set `DATA_PROVIDER=supabase`, and run the SQL in `supabase/sql/` (see below).

---

## Architecture at a glance

```
manzil-app/
├─ app/
│  ├─ page.tsx                Homepage (RSC) — hero, featured, developments, areas
│  ├─ properties/page.tsx     Search / listings — URL-driven faceted filters (SEO-safe)
│  ├─ property/[slug]/page.tsx  Listing detail — gallery, specs, lead form, similar
│  ├─ projects/               New developments index + detail
│  ├─ agents · sell · about · blog · rent(redirect)
│  ├─ robots.ts · sitemap.ts  SEO surfaces (sitemap is DB-driven)
│  └─ api/leads/route.ts      Lead capture endpoint
├─ components/                layout · ui · property · search · seo · home
├─ lib/
│  ├─ data/                   types + Store interface + Local & Supabase stores
│  ├─ services/               search-service + media-service (provider seams)
│  ├─ supabase/               admin (service-role) · server (cookies/RLS) · browser clients
│  ├─ env.ts · utils.ts · site.ts
└─ supabase/sql/              schema + runtime search objects
```

### The three seams that make the stack swappable
1. **`lib/data/store.ts`** — the data-access seam. `LocalStore` (no backend) ⇄ `SupabaseStore` (PostgreSQL).
2. **`lib/services/search-service.ts`** — search engine seam. Ships a working **Postgres FTS** adapter; drop-in Meilisearch + Algolia adapters are already written (just enable via `SEARCH_PROVIDER` + env). Adapters return matching ids and hydrate through the store, so the UI is untouched.
3. **`lib/services/media-service.ts`** — media seam. **Supabase Storage** now; Cloudinary + S3 adapters included, flip via `MEDIA_PROVIDER`. The UI never names a bucket/provider.

**Realtime/RLS:** the `supabase/sql/` scripts set up Row-Level-Security with an `app_role()` helper, agent-scoped leads, `saved_properties`, and full-text search over a generated `tsvector`. Postgres RLS means Supabase Realtime (when enabled on `listings`/`leads`) automatically respects per-row policies.

### Relational location hierarchy (never a giant text field)
Locations are modelled as a **relational tree**: `Country → Province → City → Area → Society/Project → Phase → Sector → Block → Property`.

- In Postgres (`/home/user/manzil/docs/hierarchy-schema.sql`): one normalised table per level with parent **foreign keys**, a `listings` row that points at the deepest applicable level (`area_id/project_id/phase_id/sector_id/block_id`), consistency triggers, and a view that reconstructs the full path by joining — nothing stored concatenated.
- In the app (local mode): the same tree lives as discrete parent/child nodes (`data/db.json → locations`); each listing stores only its `locationId` FK. Display labels are **derived** by climbing the links (`lib/data/hierarchy.ts`), never read from a stored path.
- Working proof in the running app: `/locations` is a true relational drill-down (Pakistan → Punjab → Lahore → DHA → DHA Lahore → …) with subtree counts; `/admin/locations` manages the tree by adding nodes under a parent; property detail pages show breadcrumbs rebuilt from the FK chain.

---

## UI & components
- **Server Components first.** Pages fetch data server-side; only genuinely interactive parts are client components (search form, filter panel, gallery, save-heart, lead form, mobile nav).
- Reusable design-system atoms in `components/ui/primitives.tsx` + `globals.css` (`btn-*`, `kicker`, `ctl`, `chip`, `badge-*`, `prop-card`…).
- SEO: `Metadata` API per route, canonical URLs, OpenGraph, JSON-LD (`RealEstateAgent`, `Product` per listing, `BreadcrumbList`), DB-driven `sitemap.ts`.

---

## Connecting Supabase
1. Create a project, then in **SQL editor** run, in order:
   - `supabase/sql/schema.sql`  — (see `/home/user/manzil/docs/database-schema.sql`) full DDL: enums, hierarchy, listings, media, leads/deals, RLS.
   - `supabase/sql/runtime.sql` — `v_listing_search` view, `manzil_search` RPC (Postgres FTS), count helper.
2. **Storage:** create a public bucket named `manzil`. Upload folders follow `<kind>s/<entity-id>/<file>`.
3. **Auth:** enable email + phone; create an admin profile row (`role='admin'`).
4. Set `.env.local`: `DATA_PROVIDER=supabase`, `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## Roadmap beyond this milestone
Admin dashboard (listings CRUD + bulk, agents, CMS) · agent workspace (leads/deals pipeline) · auth-gated saved properties & dashboard · listing submission wizard · media upload flow via Storage · ISR for listing pages · switch search to Meilisearch when listing volume grows.

---

## Robust properties table (`docs/properties-table.sql`)
The canonical `properties` table follows the requested column set (id, slug, title, description, property_type, listing_type, status, price + `price_unit` + `currency`, area + `area_unit`, bedrooms/bathrooms/floors, construction_year, furnishing_status, possession_status, development_status, property_number, street, `location_id`/`project_id`/`phase_id`/`sector_id`/`block_id`, latitude/longitude, featured, verified, views, created_at/updated_at). Design rules: **no irrelevant columns per property** — type-specific facts live in a JSONB `attributes` column and child tables (`property_media`, `property_features`), a derived `price_per_marla`/`area_marla_eq` generated column powers land comparison, and geo is a PostGIS generated column. The app's `Listing` model mirrors this with optional shared fields + an `attributes` map; admin captures floors/year/furnishing/possession/street/geo/attributes, and the detail page renders Built-year / floors / furnishing chips.

## Property-type taxonomy
- **15 property types** (Residential Plot, Commercial Plot, House, Villa, Apartment, Flat, Office, Shop, Plaza, Farmhouse, Agricultural Land, Warehouse, Building, Industrial, Other) modelled as a single `kind` enum; the filter UI groups them (Plots & Land / Residential / Commercial / Other).
- **Listing type (purpose):** `sale | rent | lease` (For Sale / For Rent / For Lease).
- **Property status:** `available | sold | rented | reserved | under_offer | pending_verification | draft`, surfaced as badges; only live statuses (`available`, `under_offer`, `reserved`) browse publicly by default, and the search filters/status param can expose the rest.
- SQL enums are defined fresh in `docs/database-schema.sql`; `docs/taxonomy-migration.sql` migrates an existing DB.

## Business-objective coverage

**Visitor:** Browse / search / filter (`/properties`, URL-driven facets) · detailed property pages with gallery, plot/unit numbers, phase·sector·block breadcrumbs · browse **projects** (`/projects`) and **locations / phases / sectors / blocks** (`/locations`) · contact dealers via WhatsApp & call CTAs · **request information** (lead forms on listing + project) · **save/favourite** (heart → `/saved`) · **compare** (+ button → floating tray → `/compare`) · **share** (native share / copy link).

**Admin (`/admin`):** Dashboard · add / edit / delete listings · publish / unpublish & feature toggles · manage images (gallery URLs, cover = first) & floor plans · manage projects (add/update/delete, feature) · manage location taxonomy (city / phase / sector / block / plot number on each listing) · edit website content (hero + contact copy). In **local mode** admin writes persist to `data/db.json` and appear on the site instantly; with Supabase they target PostgreSQL (service-role + RLS). A full upload workflow (Supabase Storage), per-area CMS pages and auth-gating of `/admin` are the documented next step.

## Scripts
`npm run dev` · `npm run build` · `npm start` · `npm run typecheck` · `npm run lint`
