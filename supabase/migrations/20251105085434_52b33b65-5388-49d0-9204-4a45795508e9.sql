-- Fix PostgREST embedding: ensure FK from submissions.student_id -> public.profiles.id
ALTER TABLE public.submissions
DROP CONSTRAINT IF EXISTS submissions_student_id_fkey;

ALTER TABLE public.submissions
ADD CONSTRAINT submissions_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;

-- Optional: create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.submissions (student_id);
