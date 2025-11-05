-- Add missing foreign key constraint from submissions to profiles
ALTER TABLE public.submissions
ADD CONSTRAINT submissions_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;