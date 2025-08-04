-- Enable RLS on violation_code_sections table
ALTER TABLE public.violation_code_sections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read violation code sections
CREATE POLICY "Allow authenticated users to read violation code sections" 
ON public.violation_code_sections 
FOR SELECT 
USING (true);

-- Create policy to allow admins to manage violation code sections
CREATE POLICY "Only admins can manage violation code sections" 
ON public.violation_code_sections 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());