
-- Create a function to delete all violations (bypassing RLS)
CREATE OR REPLACE FUNCTION public.delete_all_violations()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.violations;
$$;
