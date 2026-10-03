-- ============================================================================
-- TAQWA MOTORS - SUPABASE DATABASE MIGRATION & SECURITY SCRIPT
-- ============================================================================

-- 1. ADD PRIVATE_NOTE AND FEATURED COLUMNS TO VEHICLES TABLE
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS private_note TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- 2. CREATE SECURE PUBLIC VIEW (EXCLUDES PRIVATE_NOTE FOR PUBLIC ACCESS)
-- Unauthenticated public clients should query this view or public columns only.
CREATE OR REPLACE VIEW public.public_inventory AS
SELECT 
  id,
  owner_id,
  stock_number,
  make,
  model,
  variant,
  year,
  registration_number,
  chassis_number,
  mileage,
  fuel_type,
  transmission,
  color,
  condition,
  price,
  status,
  featured,
  description,
  created_at,
  updated_at
FROM public.vehicles;

-- Grant SELECT permissions on public_inventory view to anon and authenticated roles
GRANT SELECT ON public.public_inventory TO anon, authenticated;

-- 3. FUNCTION TO PERMANENTLY DELETE VEHICLES OLDER THAN 60 DAYS
-- Deletes vehicles whose original creation timestamp (created_at) is older than 60 days.
CREATE OR REPLACE FUNCTION delete_expired_vehicles()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Permanent deletion of vehicles created >= 60 days ago
  -- Foreign key ON DELETE CASCADE will clean up vehicle_images
  DELETE FROM public.vehicles
  WHERE created_at <= (NOW() - INTERVAL '60 days');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant execution permission on cleanup function to service_role and postgres
GRANT EXECUTE ON FUNCTION delete_expired_vehicles() TO service_role, postgres;

-- 4. PG_CRON SCHEDULED AUTOMATIC CLEANUP (RUNS DAILY AT MIDNIGHT UTC)
-- Note: Enable the pg_cron extension in your Supabase Dashboard under Database > Extensions if available.
-- Then execute the line below:
/*
SELECT cron.schedule(
  'auto-delete-60-day-vehicles',
  '0 0 * * *',
  $$ SELECT delete_expired_vehicles(); $$
);
*/
