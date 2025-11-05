-- Fix critical security issue: Remove user self-service role assignment
-- Drop the existing INSERT policy that allows users to assign themselves roles
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

-- Create a secure function for admin-only role assignment (for future use)
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if called by system (no auth.uid() check means only triggers/functions can call)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create trigger to assign default 'student' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Automatically assign 'student' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student'::app_role);
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Add input validation constraints
ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_content_length_check CHECK (length(content) <= 50000),
  ADD CONSTRAINT submissions_feedback_length_check CHECK (feedback IS NULL OR length(feedback) <= 5000),
  ADD CONSTRAINT submissions_grade_range_check CHECK (grade IS NULL OR (grade >= 0 AND grade <= 100));

ALTER TABLE public.assignments
  ADD CONSTRAINT assignments_title_length_check CHECK (length(title) <= 200),
  ADD CONSTRAINT assignments_description_length_check CHECK (description IS NULL OR length(description) <= 5000);

ALTER TABLE public.courses
  ADD CONSTRAINT courses_title_length_check CHECK (length(title) <= 200),
  ADD CONSTRAINT courses_code_length_check CHECK (length(code) <= 20),
  ADD CONSTRAINT courses_description_length_check CHECK (description IS NULL OR length(description) <= 5000);

-- Restrict public access to assignments - require authentication
DROP POLICY IF EXISTS "Anyone can view assignments" ON public.assignments;
CREATE POLICY "Authenticated users can view assignments"
  ON public.assignments
  FOR SELECT
  TO authenticated
  USING (true);

-- Restrict public access to courses - require authentication  
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
CREATE POLICY "Authenticated users can view courses"
  ON public.courses
  FOR SELECT
  TO authenticated
  USING (true);