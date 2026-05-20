-- ============================================================
-- Enterprise TMS Schema Updates
-- ============================================================

-- 1. SPONSORS
create table if not exists public.sponsors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  contract_url  text,
  status        text not null default 'active' check (status in ('active', 'inactive')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. EMPLOYEES (Extended profile data)
create table if not exists public.employees (
  id                uuid primary key references public.profiles(id) on delete cascade,
  iqama_number      text unique not null,
  dob_gregorian     date,
  dob_hijri         text, -- Hijri format (e.g. 1445-01-01)
  iqama_expiry_hijri text,
  sponsor_id        uuid references public.sponsors(id) on delete set null,
  photo_url         text,
  passport_url      text,
  muqeem_url        text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 3. DRIVING LICENSES
create table if not exists public.driving_licenses (
  id                uuid primary key default gen_random_uuid(),
  employee_id       uuid not null references public.profiles(id) on delete cascade,
  license_number    text not null,
  issue_year        int,
  expiry_date       date,
  license_type      text,
  license_image_url text,
  driver_card_url   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 4. SEC IDs
create table if not exists public.sec_ids (
  id            uuid primary key default gen_random_uuid(),
  employee_id   uuid not null references public.profiles(id) on delete cascade,
  region        text,
  expiry_date   date,
  front_image_url text,
  back_image_url  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 5. VEHICLE ENHANCEMENTS
alter table public.vehicles 
  add column if not exists owner_name text,
  add column if not exists moi_number text,
  add column if not exists sequence_number text,
  add column if not exists color text,
  add column if not exists registration_expiry date,
  add column if not exists mvpi_expiry date,
  add column if not exists insurance_expiry date,
  add column if not exists registration_url text,
  add column if not exists mvpi_url text,
  add column if not exists insurance_url text,
  add column if not exists image_front text,
  add column if not exists image_back text,
  add column if not exists image_left text,
  add column if not exists image_right text;

-- 6. NOTIFICATIONS
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  title       text not null,
  message     text not null,
  type        text not null default 'info' check (type in ('info', 'warning', 'error', 'success')),
  is_read     boolean not null default false,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

-- 7. ENABLE RLS
do $$
declare
  t text;
begin
  foreach t in array array[
    'sponsors','employees','driving_licenses','sec_ids','notifications'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "auth_read_%1$s" on public.%1$I;', t);
    execute format('drop policy if exists "auth_write_%1$s" on public.%1$I;', t);
    execute format('create policy "auth_read_%1$s" on public.%1$I for select to authenticated using (true);', t);
    execute format('create policy "auth_write_%1$s" on public.%1$I for all to authenticated using (true) with check (true);', t);
  end loop;
end;
$$;
