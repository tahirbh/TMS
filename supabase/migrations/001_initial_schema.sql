-- ============================================================
-- TMS Database Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null default '',
  email        text not null default '',
  role         text not null default 'dispatcher'
                 check (role in ('admin', 'dispatcher', 'supervisor', 'driver')),
  phone        text not null default '',
  avatar_url   text not null default '',
  is_active    boolean not null default true,
  site_id      uuid,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- SITES
-- ============================================================
create table if not exists public.sites (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  code          text not null unique,
  address       text not null default '',
  city          text not null default '',
  country       text not null default '',
  latitude      numeric,
  longitude     numeric,
  supervisor_id uuid references public.profiles(id) on delete set null,
  is_active     boolean not null default true,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- VEHICLES
-- ============================================================
create table if not exists public.vehicles (
  id                   uuid primary key default gen_random_uuid(),
  registration_number  text not null unique,
  make                 text not null default '',
  model                text not null default '',
  year                 int not null default extract(year from now())::int,
  type                 text not null default 'truck'
                         check (type in ('truck', 'trailer', 'van', 'tanker', 'flatbed')),
  capacity_tons        numeric not null default 0,
  status               text not null default 'available'
                         check (status in ('available', 'in_use', 'maintenance', 'inactive')),
  current_driver_id    uuid,
  current_trip_id      uuid,
  last_service_date    date,
  next_service_date    date,
  notes                text not null default '',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ============================================================
-- DRIVERS
-- ============================================================
create table if not exists public.drivers (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid not null references public.profiles(id) on delete cascade,
  license_number       text not null default '',
  license_class        text not null default '',
  license_expiry       date,
  id_number            text not null default '',
  id_expiry            date,
  medical_expiry       date,
  status               text not null default 'available'
                         check (status in ('available', 'on_trip', 'off_duty', 'suspended')),
  total_trips          int not null default 0,
  total_distance       numeric not null default 0,
  current_lat          numeric,
  current_lng          numeric,
  last_location_update timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique,
  site_id            uuid not null references public.sites(id) on delete restrict,
  created_by         uuid not null references public.profiles(id) on delete restrict,
  material_type      text not null default '',
  trailer_type       text not null default 'standard'
                       check (trailer_type in ('standard','flatbed','tanker','refrigerated','curtainsider')),
  required_vehicles  int not null default 1,
  assigned_vehicles  int not null default 0,
  quantity_tons      numeric not null default 0,
  pickup_location    text not null default '',
  pickup_lat         numeric,
  pickup_lng         numeric,
  delivery_location  text not null default '',
  delivery_lat       numeric,
  delivery_lng       numeric,
  required_date      date,
  notes              text not null default '',
  status             text not null default 'pending'
                       check (status in ('pending','assigned','in_progress','completed','cancelled')),
  priority           text not null default 'normal'
                       check (priority in ('low','normal','high','urgent')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Auto order_number sequence
create sequence if not exists order_number_seq;
create or replace function generate_order_number()
returns trigger language plpgsql as $$
begin
  new.order_number := 'ORD-' || lpad(nextval('order_number_seq')::text, 6, '0');
  return new;
end;
$$;
drop trigger if exists set_order_number on public.orders;
create trigger set_order_number
  before insert on public.orders
  for each row when (new.order_number = '')
  execute function generate_order_number();

-- ============================================================
-- INSPECTIONS
-- ============================================================
create table if not exists public.inspections (
  id                    uuid primary key default gen_random_uuid(),
  vehicle_id            uuid not null references public.vehicles(id) on delete restrict,
  driver_id             uuid not null references public.drivers(id) on delete restrict,
  inspected_by          uuid not null references public.profiles(id) on delete restrict,
  inspection_date       timestamptz not null default now(),
  tires_ok              boolean not null default false,
  brakes_ok             boolean not null default false,
  lights_ok             boolean not null default false,
  fuel_ok               boolean not null default false,
  engine_ok             boolean not null default false,
  documents_ok          boolean not null default false,
  body_condition_ok     boolean not null default false,
  safety_equipment_ok   boolean not null default false,
  overall_status        text not null default 'pending'
                          check (overall_status in ('pending','passed','failed','conditional')),
  notes                 text not null default '',
  created_at            timestamptz not null default now()
);

-- ============================================================
-- TRIPS
-- ============================================================
create table if not exists public.trips (
  id                   uuid primary key default gen_random_uuid(),
  trip_number          text not null unique,
  order_id             uuid not null references public.orders(id) on delete restrict,
  vehicle_id           uuid not null references public.vehicles(id) on delete restrict,
  driver_id            uuid not null references public.drivers(id) on delete restrict,
  dispatcher_id        uuid not null references public.profiles(id) on delete restrict,
  inspection_id        uuid references public.inspections(id) on delete set null,
  origin_name          text not null default '',
  origin_lat           numeric,
  origin_lng           numeric,
  destination_name     text not null default '',
  destination_lat      numeric,
  destination_lng      numeric,
  waypoints            jsonb not null default '[]',
  cities_en_route      text[] not null default '{}',
  route_distance_km    numeric not null default 0,
  scheduled_departure  timestamptz,
  actual_departure     timestamptz,
  scheduled_arrival    timestamptz,
  actual_arrival       timestamptz,
  status               text not null default 'assigned'
                         check (status in ('assigned','enroute','arrived_site','loading','in_transit','delivered','completed','cancelled')),
  manifest_url         text not null default '',
  delivery_note_url    text not null default '',
  proof_of_delivery_url text not null default '',
  actual_distance_km   numeric not null default 0,
  fuel_consumed        numeric not null default 0,
  notes                text not null default '',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create sequence if not exists trip_number_seq;
create or replace function generate_trip_number()
returns trigger language plpgsql as $$
begin
  new.trip_number := 'TRP-' || lpad(nextval('trip_number_seq')::text, 6, '0');
  return new;
end;
$$;
drop trigger if exists set_trip_number on public.trips;
create trigger set_trip_number
  before insert on public.trips
  for each row when (new.trip_number = '')
  execute function generate_trip_number();

-- ============================================================
-- TRIP STATUS UPDATES
-- ============================================================
create table if not exists public.trip_status_updates (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references public.trips(id) on delete cascade,
  updated_by uuid not null references public.profiles(id) on delete restrict,
  status     text not null,
  latitude   numeric,
  longitude  numeric,
  notes      text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================================
-- DOCUMENTS
-- ============================================================
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null default 'other'
                check (type in ('manifest','delivery_note','driver_license','vehicle_registration','insurance','medical','other')),
  entity_type text not null default '',
  entity_id   uuid not null,
  file_url    text not null default '',
  file_size   int not null default 0,
  mime_type   text not null default '',
  expiry_date date,
  status      text not null default 'valid'
                check (status in ('valid','near_expiry','expired')),
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  notes       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
create table if not exists public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity_type text not null default '',
  entity_id   uuid,
  details     jsonb not null default '{}',
  ip_address  text not null default '',
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — Enable on all tables
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','sites','vehicles','drivers','orders',
    'trips','trip_status_updates','documents','inspections','activity_logs'
  ] loop
    -- Enable RLS
    execute format('alter table public.%I enable row level security;', t);

    -- Drop existing policies first (CREATE POLICY has no IF NOT EXISTS in Postgres)
    execute format('drop policy if exists "auth_read_%1$s" on public.%1$I;', t);
    execute format('drop policy if exists "auth_write_%1$s" on public.%1$I;', t);

    -- Allow authenticated users to read all rows
    execute format(
      'create policy "auth_read_%1$s" on public.%1$I
       for select to authenticated using (true);', t);

    -- Allow authenticated users to insert / update / delete
    execute format(
      'create policy "auth_write_%1$s" on public.%1$I
       for all to authenticated using (true) with check (true);', t);
  end loop;
end;
$$;

-- ============================================================
-- INDEXES for common queries
-- ============================================================
create index if not exists idx_trips_status      on public.trips(status);
create index if not exists idx_trips_created_at  on public.trips(created_at desc);
create index if not exists idx_vehicles_status   on public.vehicles(status);
create index if not exists idx_drivers_status    on public.drivers(status);
create index if not exists idx_orders_status     on public.orders(status);
create index if not exists idx_documents_expiry  on public.documents(expiry_date);
create index if not exists idx_trip_updates_trip on public.trip_status_updates(trip_id);
create index if not exists idx_activity_user     on public.activity_logs(user_id);
