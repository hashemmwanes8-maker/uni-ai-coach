-- Create storage bucket for assignment submissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submissions',
  'submissions',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'application/zip'
  ]
);

-- Storage RLS: Students can upload to their own submission folders
CREATE POLICY "Students can upload their assignment files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND has_role(auth.uid(), 'student'::app_role)
);

-- Storage RLS: Students can view their own files
CREATE POLICY "Students can view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND has_role(auth.uid(), 'student'::app_role)
);

-- Storage RLS: Students can update their own files (before grading)
CREATE POLICY "Students can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND has_role(auth.uid(), 'student'::app_role)
);

-- Storage RLS: Students can delete their own files (before grading)
CREATE POLICY "Students can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND has_role(auth.uid(), 'student'::app_role)
);

-- Storage RLS: Lecturers can view files from their course submissions
CREATE POLICY "Lecturers can view course submission files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions'
  AND has_role(auth.uid(), 'lecturer'::app_role)
  AND EXISTS (
    SELECT 1
    FROM submissions s
    JOIN assignments a ON s.assignment_id = a.id
    JOIN courses c ON a.course_id = c.id
    WHERE s.student_id::text = (storage.foldername(storage.objects.name))[1]
      AND c.lecturer_id = auth.uid()
  )
);

-- Update profiles RLS: Allow lecturers to view student profiles in their courses
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
  OR
  -- Lecturers can see profiles of students who submitted in their courses
  (
    has_role(auth.uid(), 'lecturer'::app_role)
    AND EXISTS (
      SELECT 1
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.student_id = profiles.id
        AND c.lecturer_id = auth.uid()
    )
  )
);