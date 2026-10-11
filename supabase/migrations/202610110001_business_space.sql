-- CamerLink Business Space — migration à appliquer dans Supabase SQL Editor.
-- Vitrine gratuite. Les demandes de visibilité payante sont enregistrées comme demandes,
-- aucun paiement n'est encaissé par cette migration.

create table if not exists public.business_spaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  category text not null check (char_length(category) between 2 and 60),
  description text not null default '' check (char_length(description) <= 2000),
  city text not null default '' check (char_length(city) <= 100),
  address text not null default '' check (char_length(address) <= 250),
  phone text not null default '' check (char_length(phone) <= 40),
  whatsapp text not null default '' check (char_length(whatsapp) <= 40),
  opening_hours text not null default '' check (char_length(opening_hours) <= 300),
  logo_url text not null default '' check (char_length(logo_url) <= 1000),
  cover_url text not null default '' check (char_length(cover_url) <= 1000),
  website_url text not null default '' check (char_length(website_url) <= 1000),
  status text not null default 'published' check (status in ('published','paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_spaces_public_idx
  on public.business_spaces (status, created_at desc);
create index if not exists business_spaces_owner_idx
  on public.business_spaces (owner_id, updated_at desc);

alter table public.business_spaces enable row level security;
drop policy if exists "business spaces are publicly readable when published" on public.business_spaces;
create policy "business spaces are publicly readable when published"
  on public.business_spaces for select using (status = 'published' or auth.uid() = owner_id);
drop policy if exists "owners create their business space" on public.business_spaces;
create policy "owners create their business space"
  on public.business_spaces for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "owners update their business space" on public.business_spaces;
create policy "owners update their business space"
  on public.business_spaces for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "owners delete their business space" on public.business_spaces;
create policy "owners delete their business space"
  on public.business_spaces for delete to authenticated using (auth.uid() = owner_id);

create table if not exists public.business_catalog_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_spaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  price_xaf numeric(12,2) check (price_xaf is null or price_xaf >= 0),
  image_url text not null default '' check (char_length(image_url) <= 1000),
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists business_catalog_business_idx on public.business_catalog_items (business_id, created_at desc);
alter table public.business_catalog_items enable row level security;
drop policy if exists "catalog is public for published businesses" on public.business_catalog_items;
create policy "catalog is public for published businesses"
  on public.business_catalog_items for select using (
    auth.uid() = owner_id or exists (
      select 1 from public.business_spaces b
      where b.id = business_id and b.status = 'published'
    )
  );
drop policy if exists "owners add catalog items" on public.business_catalog_items;
create policy "owners add catalog items"
  on public.business_catalog_items for insert to authenticated with check (
    auth.uid() = owner_id and exists (
      select 1 from public.business_spaces b where b.id = business_id and b.owner_id = auth.uid()
    )
  );
drop policy if exists "owners update catalog items" on public.business_catalog_items;
create policy "owners update catalog items"
  on public.business_catalog_items for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "owners delete catalog items" on public.business_catalog_items;
create policy "owners delete catalog items"
  on public.business_catalog_items for delete to authenticated using (auth.uid() = owner_id);

create table if not exists public.business_visibility_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_spaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  option text not null check (option in ('boost','verified','campaign')),
  message text not null default '' check (char_length(message) <= 1000),
  status text not null default 'pending' check (status in ('pending','contacted','approved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists business_visibility_owner_idx on public.business_visibility_requests (owner_id, created_at desc);
alter table public.business_visibility_requests enable row level security;
drop policy if exists "owners see their visibility requests" on public.business_visibility_requests;
create policy "owners see their visibility requests"
  on public.business_visibility_requests for select to authenticated using (auth.uid() = owner_id);
drop policy if exists "owners submit visibility requests" on public.business_visibility_requests;
create policy "owners submit visibility requests"
  on public.business_visibility_requests for insert to authenticated with check (
    auth.uid() = owner_id and exists (
      select 1 from public.business_spaces b where b.id = business_id and b.owner_id = auth.uid()
    )
  );

grant select on public.business_spaces, public.business_catalog_items to anon, authenticated;
grant insert, update, delete on public.business_spaces, public.business_catalog_items to authenticated;
grant select, insert on public.business_visibility_requests to authenticated;
