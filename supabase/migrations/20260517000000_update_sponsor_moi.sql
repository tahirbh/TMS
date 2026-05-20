-- ============================================================
-- Migration: Rebuild Sponsor Relation to lowercase 'moi'
-- ============================================================

-- 1. Drop the old foreign key constraint and UUID column if they exist
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_sponsor_id_fkey;
ALTER TABLE public.employees DROP COLUMN IF EXISTS sponsor_id;

-- 2. Add the sponsor_moi column as a text field referencing public.sponsors(moi)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS sponsor_moi TEXT;

-- 3. Establish the foreign key constraint pointing to the unique lowercase 'moi' column in sponsors
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_sponsor_moi_fkey;
ALTER TABLE public.employees 
  ADD CONSTRAINT employees_sponsor_moi_fkey 
  FOREIGN KEY (sponsor_moi) 
  REFERENCES public.sponsors(moi) 
  ON DELETE SET NULL;
