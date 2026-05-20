-- ============================================================
-- BUSINESS LOGIC & FLEET EXPANSION
-- ============================================================

-- 1. LABOR ENTITY
create table if not exists public.labor (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  iqama_number   text not null unique,
  nationality    text not null default 'Saudi',
  profession     text not null default 'Labor',
  phone          text,
  status         text not null default 'available',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 2. LABOR MOBILIZATION (Deployment)
create table if not exists public.labor_mobilization (
  id             uuid primary key default gen_random_uuid(),
  labor_id       uuid not null references public.labor(id) on delete cascade,
  site_id        uuid not null references public.sites(id) on delete cascade,
  supervisor_id  uuid not null references public.profiles(id) on delete set null,
  start_date     date not null default current_date,
  end_date       date,
  status         text not null default 'active'
                   check (status in ('active', 'completed', 'cancelled')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 3. BREAKDOWN REQUESTS
create table if not exists public.breakdown_requests (
  id             uuid primary key default gen_random_uuid(),
  vehicle_id     uuid not null references public.vehicles(id) on delete cascade,
  reported_by    uuid not null references public.profiles(id),
  description    text not null,
  status         text not null default 'pending'
                   check (status in ('pending', 'in_progress', 'resolved', 'cancelled')),
  priority       text not null default 'normal'
                   check (priority in ('low', 'normal', 'high', 'urgent')),
  resolved_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 4. TRIP LEDGER (Financials)
create table if not exists public.trip_ledger (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid not null unique references public.trips(id) on delete cascade,
  distance_km    numeric not null default 0,
  allowance_sr   numeric not null default 0,
  cost_per_km    numeric not null default 0,
  total_cost_sr  numeric not null default 0,
  calculated_at  timestamptz not null default now()
);

-- 5. SCHEMA UPDATES
alter table public.trips 
  add column if not exists net_weight numeric default 0,
  add column if not exists bayan_url text default '',
  add column if not exists pod_url text default '';

-- 6. RLS POLICIES
do $$
declare
  t text;
begin
  foreach t in array array['labor', 'labor_mobilization', 'breakdown_requests', 'trip_ledger'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "auth_read_%1$s" on public.%1$I;', t);
    execute format('drop policy if exists "auth_write_%1$s" on public.%1$I;', t);
    execute format('create policy "auth_read_%1$s" on public.%1$I for select to authenticated using (true);', t);
    execute format('create policy "auth_write_%1$s" on public.%1$I for all to authenticated using (true) with check (true);', t);
  end loop;
end;
$$;
