
-- Update addresses with parcel_id from violations table using substring match
UPDATE public.addresses 
SET parcel_id = (
  SELECT parcel_id 
  FROM public.violations 
  WHERE violations.address ILIKE '%' || addresses.address || '%'
  AND violations.parcel_id IS NOT NULL 
  LIMIT 1
)
WHERE parcel_id IS NULL;
