-- ============================================================
-- Document Management System (DMS) Vault
-- ============================================================

-- 1. DOCUMENTS TABLE
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null, -- 'Iqama', 'License', 'Registration', etc.
  file_url      text not null,
  storage_path  text not null,
  entity_type   text not null, -- 'employee', 'vehicle', 'sponsor', etc.
  entity_id     uuid, -- Reference to the specific entity
  expiry_date   date,
  status        text not null default 'valid' check (status in ('valid', 'near_expiry', 'expired')),
  metadata      jsonb default '{}',
  created_by    uuid references public.profiles(id),
  uploaded_by   uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. ENABLE RLS
alter table public.documents enable row level security;

drop policy if exists "auth_read_documents" on public.documents;
create policy "auth_read_documents" on public.documents 
  for select to authenticated using (true);

drop policy if exists "auth_write_documents" on public.documents;
create policy "auth_write_documents" on public.documents 
  for all to authenticated using (true) with check (true);

-- 3. STORAGE BUCKET (Mock for documentation, actual creation via API/Dashboard)
-- Insert into storage.buckets (id, name, public) values ('documents', 'documents', true);
