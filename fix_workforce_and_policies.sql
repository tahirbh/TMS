-- ============================================================
-- 0. PURGE LEGACY DUMMY RECORDS (KEEPS ONLY ADMINISTRATIVE/SUPERVISOR LOGINS)
-- ============================================================
-- Dynamic programmatic purge that only truncates tables if they exist in the schema
do $$
declare
  t text;
begin
  foreach t in array array[
    'trip_status_updates','trip_ledger','trips','inspections',
    'breakdowns','orders','labor_mobilization','fleet_combinations',
    'maintenance_records','documents','employees','sponsors'
  ] loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      execute format('truncate table public.%I cascade;', t);
    end if;
  end loop;
end;
$$;

-- Delete old dummy driver and labor accounts (preserves active admin, dispatcher, and supervisor profiles)
delete from public.profiles where role in ('driver', 'labor');

-- ============================================================
-- 1. UPGRADE EMPLOYEES TABLE WITH CONSOLIDATED COLUMNS
-- ============================================================
alter table public.employees 
  add column if not exists license_number text,
  add column if not exists status text not null default 'available',
  add column if not exists nationality text not null default 'Pakistani',
  add column if not exists profession text not null default 'Labor',
  add column if not exists phone text;

-- ============================================================
-- 2. PRUNE OBSOLETE SCHEMAS IF THEY EXIST (DELETES OLD DUMMY SEEDED TABLES)
-- ============================================================
-- Migrate labor role checks on profiles if restricted
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'dispatcher', 'supervisor', 'driver', 'labor'));

-- Safely drop legacy tables to clear obsolete dummy seeded structures
drop table if exists public.drivers cascade;
drop table if exists public.labor cascade;

-- ============================================================
-- 3. ESTABLISH CASCADING DELETES ON FOREIGN KEYS
-- ============================================================

-- A. Re-bind Employees id references to profiles with cascade
alter table public.employees drop constraint if exists employees_id_fkey;
alter table public.employees add constraint employees_id_fkey foreign key (id) references public.profiles(id) on delete cascade;

-- B. Re-bind Orders references to sites with cascade
alter table public.orders drop constraint if exists orders_site_id_fkey;
alter table public.orders add constraint orders_site_id_fkey foreign key (site_id) references public.sites(id) on delete cascade;

-- C. Re-bind Trips references to vehicles and drivers with cascade
alter table public.trips drop constraint if exists trips_vehicle_id_fkey;
alter table public.trips add constraint trips_vehicle_id_fkey foreign key (vehicle_id) references public.vehicles(id) on delete cascade;

alter table public.trips drop constraint if exists trips_driver_id_fkey;
alter table public.trips add constraint trips_driver_id_fkey foreign key (driver_id) references public.profiles(id) on delete cascade;

-- D. Re-bind Inspections references to vehicles and drivers with cascade
alter table public.inspections drop constraint if exists inspections_vehicle_id_fkey;
alter table public.inspections add constraint inspections_vehicle_id_fkey foreign key (vehicle_id) references public.vehicles(id) on delete cascade;

alter table public.inspections drop constraint if exists inspections_driver_id_fkey;
alter table public.inspections add constraint inspections_driver_id_fkey foreign key (driver_id) references public.profiles(id) on delete cascade;

-- ============================================================
-- 4. RECREATE RLS POLICIES FOR ALL TABLES (FIX DELETE FAILURE)
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','sites','vehicles','trailers','orders','trips',
    'trip_status_updates','documents','inspections','activity_logs',
    'sponsors','employees','driving_licenses','sec_ids','notifications',
    'labor_mobilization','breakdowns','trip_ledger','maintenance_records'
  ] loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      -- Ensure RLS is active
      execute format('alter table public.%I enable row level security;', t);

      -- Clear old policies
      execute format('drop policy if exists "auth_read_%1$s" on public.%1$I;', t);
      execute format('drop policy if exists "auth_write_%1$s" on public.%1$I;', t);
      execute format('drop policy if exists "auth_write_all_%1$s" on public.%1$I;', t);

      -- Allow authenticated users to read
      execute format('create policy "auth_read_%1$s" on public.%1$I for select to authenticated using (true);', t);

      -- Allow authenticated users to write (INSERT, UPDATE, DELETE)
      execute format('create policy "auth_write_all_%1$s" on public.%1$I for all to authenticated using (true);', t);
    end if;
  end loop;
end;
$$;
