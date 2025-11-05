-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Anyone can view assignments
CREATE POLICY "Anyone can view assignments"
ON public.assignments
FOR SELECT
USING (true);

-- Lecturers can create assignments for their courses
CREATE POLICY "Lecturers can create assignments for their courses"
ON public.assignments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_id
    AND courses.lecturer_id = auth.uid()
    AND has_role(auth.uid(), 'lecturer'::app_role)
  )
);

-- Lecturers can update their course assignments
CREATE POLICY "Lecturers can update their course assignments"
ON public.assignments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_id
    AND courses.lecturer_id = auth.uid()
    AND has_role(auth.uid(), 'lecturer'::app_role)
  )
);

-- Lecturers can delete their course assignments
CREATE POLICY "Lecturers can delete their course assignments"
ON public.assignments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_id
    AND courses.lecturer_id = auth.uid()
    AND has_role(auth.uid(), 'lecturer'::app_role)
  )
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  grade NUMERIC,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS on submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Students can view their own submissions
CREATE POLICY "Students can view their own submissions"
ON public.submissions
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- Lecturers can view submissions for their course assignments
CREATE POLICY "Lecturers can view course submissions"
ON public.submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.courses c ON a.course_id = c.id
    WHERE a.id = assignment_id
    AND c.lecturer_id = auth.uid()
    AND has_role(auth.uid(), 'lecturer'::app_role)
  )
);

-- Students can create their own submissions
CREATE POLICY "Students can create submissions"
ON public.submissions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND has_role(auth.uid(), 'student'::app_role)
);

-- Students can update their own submissions (before grading)
CREATE POLICY "Students can update their own submissions"
ON public.submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id AND grade IS NULL);

-- Lecturers can update submissions for their courses (grading)
CREATE POLICY "Lecturers can grade submissions"
ON public.submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.courses c ON a.course_id = c.id
    WHERE a.id = assignment_id
    AND c.lecturer_id = auth.uid()
    AND has_role(auth.uid(), 'lecturer'::app_role)
  )
);

-- Create trigger for assignments updated_at
CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for submissions updated_at
CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();