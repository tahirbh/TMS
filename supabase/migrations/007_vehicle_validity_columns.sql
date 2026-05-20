-- Migration: Add vehicle validity and authorization columns
-- These columns track expiry dates for regulatory compliance

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS registration_expiry     DATE         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS insurance_expiry        DATE         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS authorized_driver       TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS authorization_expiry    DATE         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS mvpi_expiry             DATE         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sequence_number         TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS owner_name              TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS color                   TEXT         DEFAULT NULL;

-- Create indexes for expiry date queries (used by dashboard validity donut charts)
CREATE INDEX IF NOT EXISTS idx_vehicles_registration_expiry  ON public.vehicles(registration_expiry);
CREATE INDEX IF NOT EXISTS idx_vehicles_insurance_expiry     ON public.vehicles(insurance_expiry);
CREATE INDEX IF NOT EXISTS idx_vehicles_authorization_expiry ON public.vehicles(authorization_expiry);
CREATE INDEX IF NOT EXISTS idx_vehicles_mvpi_expiry          ON public.vehicles(mvpi_expiry);
