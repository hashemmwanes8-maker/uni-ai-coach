import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const SubmitAssignment = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user, loading } = useAuth("student");
  const navigate = useNavigate();
  const [fileName, setFileName] = useState<string>("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAssignment();
    }
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          *,
          course:courses(
            title,
            code
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setAssignment(data);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      toast({
        title: "Error",
        description: "Failed to load assignment",
        variant: "destructive",
      });
    } finally {
      setLoadingAssignment(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter your submission content",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("submissions").insert({
        assignment_id: id,
        student_id: user?.id,
        content: content,
        file_url: fileName || null,
      });

      if (error) throw error;

      toast({
        title: "Assignment Submitted!",
        description: "Your assignment has been submitted successfully and is under review.",
      });

      navigate("/student/dashboard");
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingAssignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Assignment not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link to="/student/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{assignment.title}</CardTitle>
            <CardDescription>
              {assignment.course?.code} - {assignment.course?.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Assignment Description</h3>
              <p className="text-sm text-muted-foreground">
                {assignment.description || "No description provided"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Due Date</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(assignment.due_date).toLocaleString()}
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Submit Your Work</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Upload Document</Label>
                  <div className="mt-2">
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {fileName && (
                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <FileText className="mr-2 h-4 w-4" />
                        {fileName}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accepted formats: PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>

                <div>
                  <Label htmlFor="content">Your Submission *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your assignment content here..."
                    className="mt-2"
                    rows={8}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </p>
                  <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                    <Upload className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Assignment"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SubmitAssignment;
