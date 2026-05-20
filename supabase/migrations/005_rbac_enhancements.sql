-- ============================================================
-- RBAC & Permissions Enhancements
-- ============================================================

-- 1. UPDATE ROLES CONSTRAINT
-- First, drop the existing check constraint on profiles
alter table public.profiles drop constraint if exists profiles_role_check;

-- Add updated roles check
alter table public.profiles add constraint profiles_role_check 
  check (role in (
    'super_admin', 
    'management', 
    'operations_manager', 
    'fleet_supervisor', 
    'hr', 
    'document_controller', 
    'driver', 
    'read_only_viewer',
    'admin', -- backward compatibility
    'dispatcher', -- backward compatibility
    'supervisor' -- backward compatibility
  ));

-- 2. PERMISSIONS TABLE
create table if not exists public.permissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  code        text not null unique, -- e.g. 'fleet.view', 'fleet.edit'
  category    text not null, -- e.g. 'fleet', 'employees', 'trips'
  created_at  timestamptz not null default now()
);

-- 3. ROLE PERMISSIONS (Permission Matrix)
create table if not exists public.role_permissions (
  id             uuid primary key default gen_random_uuid(),
  role           text not null,
  permission_id  uuid not null references public.permissions(id) on delete cascade,
  unique(role, permission_id)
);

-- 4. SEED BASIC PERMISSIONS
insert into public.permissions (name, code, category) values
  ('View Fleet', 'fleet.view', 'fleet'),
  ('Edit Fleet', 'fleet.edit', 'fleet'),
  ('View Employees', 'employees.view', 'employees'),
  ('Edit Employees', 'employees.edit', 'employees'),
  ('Manage Sponsors', 'sponsors.manage', 'sponsors'),
  ('Generate Reports', 'reports.generate', 'analytics'),
  ('System Admin', 'system.admin', 'admin')
on conflict do nothing;

-- 5. ENABLE RLS
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists "auth_read_permissions" on public.permissions;
create policy "auth_read_permissions" on public.permissions for select to authenticated using (true);

drop policy if exists "auth_read_role_permissions" on public.role_permissions;
create policy "auth_read_role_permissions" on public.role_permissions for select to authenticated using (true);
