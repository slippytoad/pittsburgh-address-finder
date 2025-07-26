-- Add the first admin user to user_roles table
-- Replace this with your actual Google email/user ID after authentication
-- This is a placeholder - you'll need to get your actual user_id from the auth.users table

-- First, let's see if there are any users in auth.users table
-- Note: This is just for reference, the actual user_id will need to be inserted manually

-- For now, let's create a function to help add the first admin
CREATE OR REPLACE FUNCTION add_first_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user from auth.users (assuming that's you)
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Insert them as admin if they exist and aren't already in user_roles
    IF first_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (first_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$;

-- Execute the function to add the first admin
SELECT add_first_admin_user();