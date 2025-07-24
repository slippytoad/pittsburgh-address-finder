-- Fix the remaining function search path security issue
CREATE OR REPLACE FUNCTION public.delete_all_violations()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  DELETE FROM public.violations;
$function$;