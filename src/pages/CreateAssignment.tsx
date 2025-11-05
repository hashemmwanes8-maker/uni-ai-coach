import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const assignmentSchema = z.object({
  courseId: z.string().min(1, "Please select a course"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Please set a due date"),
});

const CreateAssignment = () => {
  const { user, loading } = useAuth("lecturer");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
  });

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("lecturer_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validated = assignmentSchema.parse(formData);

      const { error } = await supabase.from("assignments").insert({
        course_id: validated.courseId,
        title: validated.title,
        description: validated.description,
        due_date: validated.dueDate,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Assignment created successfully",
      });
      
      navigate("/lecturer/dashboard");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error("Error creating assignment:", error);
        toast({
          title: "Error",
          description: "Failed to create assignment",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link to="/lecturer/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Assignment</CardTitle>
            <CardDescription>Create a new assignment for your students</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger id="course" className="mt-2">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Research Paper: AI in Education"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide assignment details, requirements, and guidelines..."
                  className="mt-2"
                  rows={6}
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => navigate("/lecturer/dashboard")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateAssignment;
