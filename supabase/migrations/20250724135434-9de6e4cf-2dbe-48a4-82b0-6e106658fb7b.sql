-- Fix critical RLS security issue
ALTER TABLE public.push_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for push_settings table
CREATE POLICY "Allow anyone to read push settings" 
ON public.push_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Allow anyone to insert push settings" 
ON public.push_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anyone to update push settings" 
ON public.push_settings 
FOR UPDATE 
USING (true);

-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT public.has_role(auth.uid(), 'admin');
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$function$;