-- ============================================================
-- 1. FIX PROFILES ROLE CHECK CONSTRAINT
-- ============================================================
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'dispatcher', 'supervisor', 'driver', 'labor'));

-- ============================================================
-- 2. EXTEND public.employees TABLE WITH CONSOLIDATED COLUMNS
-- ============================================================
alter table public.employees 
  add column if not exists license_number text,
  add column if not exists status text not null default 'available',
  add column if not exists nationality text not null default 'Pakistani',
  add column if not exists profession text not null default 'Labor',
  add column if not exists phone text;

-- ============================================================
-- 3. MIGRATE DATA FROM LEGACY TABLES
-- ============================================================

-- A. Migrate Labor to Profiles
insert into public.profiles (id, full_name, email, role, is_active)
select 
  id, 
  name, 
  lower(replace(name, ' ', '')) || '@tms-labor.com', 
  'labor', 
  is_active
from public.labor
on conflict (id) do nothing;

-- B. Migrate Labor to Employees
insert into public.employees (id, iqama_number, nationality, profession, phone, status, notes)
select 
  id, 
  iqama_number, 
  nationality, 
  profession, 
  phone, 
  status, 
  'Migrated from legacy labor table.'
from public.labor
on conflict (id) do nothing;

-- C. Migrate Drivers to Employees
insert into public.employees (id, iqama_number, license_number, status, nationality, profession)
select 
  d.profile_id, 
  coalesce(d.id_number, 'DRV-' || floor(random()*1000000)::text), 
  d.license_number, 
  d.status, 
  'Pakistani', 
  'Driver'
from public.drivers d
on conflict (id) do update set 
  license_number = excluded.license_number,
  status = excluded.status;

-- ============================================================
-- 4. RE-BIND SYSTEM CONSTRAINTS TO PROFILES
-- ============================================================

-- A. Trips
alter table public.trips drop constraint if exists trips_driver_id_fkey;
update public.trips t set driver_id = d.profile_id from public.drivers d where t.driver_id = d.id;
alter table public.trips add constraint trips_driver_id_fkey foreign key (driver_id) references public.profiles(id) on delete restrict;

-- B. Labor Mobilization
alter table public.labor_mobilization drop constraint if exists labor_mobilization_labor_id_fkey;
alter table public.labor_mobilization add constraint labor_mobilization_labor_id_fkey foreign key (labor_id) references public.profiles(id) on delete cascade;

-- ============================================================
-- 5. PRUNE OBSOLETE LEGACY SCHEMAS
-- ============================================================
drop table if exists public.drivers cascade;
drop table if exists public.labor cascade;
