
-- Add parcel_id column to addresses table
ALTER TABLE public.addresses 
ADD COLUMN parcel_id text;

-- Update addresses with parcel_id from violations table
-- We'll use the first parcel_id found for each address
UPDATE public.addresses 
SET parcel_id = (
  SELECT parcel_id 
  FROM public.violations 
  WHERE violations.address = addresses.address 
  AND violations.parcel_id IS NOT NULL 
  LIMIT 1
);
