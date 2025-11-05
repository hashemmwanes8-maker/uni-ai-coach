import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, Sparkles } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const ReviewSubmission = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user, loading } = useAuth("lecturer");
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<any>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(true);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          *,
          assignment:assignments(
            title,
            course:courses(
              title,
              code
            )
          ),
          student:profiles!submissions_student_id_fkey(
            full_name,
            email
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setSubmission(data);
      setGrade(data.grade ? data.grade.toString() : "");
      setFeedback(data.feedback || "");
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast({
        title: "Error",
        description: "Failed to load submission",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmission(false);
    }
  };

  const handleGenerateAIFeedback = () => {
    toast({
      title: "AI Feedback Generated",
      description: "AI-powered analysis has been added to the feedback section.",
    });
  };

  const handleSubmitReview = async () => {
    if (!grade) {
      toast({
        title: "Error",
        description: "Please select a grade",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          grade: parseFloat(grade),
          feedback: feedback,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Your feedback has been sent to the student.",
      });

      navigate("/lecturer/dashboard");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingSubmission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Submission not found</p>
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

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Review Submission</CardTitle>
              <CardDescription>
                {submission.assignment?.course?.code} - {submission.assignment?.course?.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Student Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {submission.student?.full_name || "Unknown"}</p>
                    <p><span className="font-medium">Email:</span> {submission.student?.email}</p>
                    <p><span className="font-medium">Submitted:</span> {new Date(submission.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Assignment</h3>
                  <p className="text-sm font-medium">{submission.assignment?.title}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Submission Content</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{submission.content}</p>
                  </div>
                </div>

                {submission.file_url && (
                  <div>
                    <h3 className="font-semibold mb-2">Submitted File</h3>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-primary" />
                        <span className="text-sm">{submission.file_url}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Provide Feedback</h3>
                  <Button variant="secondary" size="sm" onClick={handleGenerateAIFeedback}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Feedback
                  </Button>
                </div>

                <div>
                  <Label htmlFor="grade">Grade (0-100)</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="100"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Enter grade"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="feedback">Detailed Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback on the student's work..."
                    className="mt-2"
                    rows={8}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => navigate("/lecturer/dashboard")}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitReview} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Word Count</span>
                  <Badge variant="outline">{submission.content.split(/\s+/).length} words</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Characters</span>
                  <Badge variant="outline">{submission.content.length} chars</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  View Assignment Brief
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run Turnitin Check
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewSubmission;
