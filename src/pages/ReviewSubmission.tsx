import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, Sparkles, Send } from "lucide-react";
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
  const [generatingAI, setGeneratingAI] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(false);

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
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fetch student profile separately
      const { data: studentData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", data.student_id)
        .single();

      setSubmission({ ...data, student: studentData });
      setGrade(data.grade ? data.grade.toString() : "");
      setFeedback(data.feedback || "");
    } catch (error: any) {
      // Silent fail - will show "Submission not found" state
    } finally {
      setLoadingSubmission(false);
    }
  };

  const handleGenerateAIFeedback = async () => {
    if (!submission?.content) {
      toast({
        title: "Error",
        description: "No submission content available to analyze.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-feedback', {
        body: {
          submissionContent: submission.content,
          assignmentTitle: submission.assignment?.title,
          submissionId: id
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.feedback) {
        setFeedback(data.feedback);
        toast({
          title: "AI Feedback Generated",
          description: "AI-powered analysis has been added to the feedback section.",
        });
      }
    } catch (error: any) {
      console.error('AI feedback error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleDownloadFile = async () => {
    if (!submission?.file_url) return;

    setDownloadingFile(true);
    try {
      const { data, error } = await supabase.storage
        .from('submissions')
        .download(submission.file_url);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = submission.file_url.split('/').pop() || 'submission';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    } finally {
      setDownloadingFile(false);
    }
  };

  const handleSubmitReview = async () => {
    const trimmedFeedback = feedback.trim();
    const numericGrade = parseFloat(grade);

    if (!grade || isNaN(numericGrade)) {
      toast({
        title: "Error",
        description: "Please enter a valid grade",
        variant: "destructive",
      });
      return;
    }

    if (numericGrade < 0 || numericGrade > 100) {
      toast({
        title: "Error",
        description: "Grade must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    if (trimmedFeedback.length > 5000) {
      toast({
        title: "Error",
        description: "Feedback must be less than 5,000 characters",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          grade: numericGrade,
          feedback: trimmedFeedback || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Your feedback has been sent to the student.",
      });

      navigate("/lecturer/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Unable to submit review. Please try again.",
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
                        <span className="text-sm">File attached</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDownloadFile}
                        disabled={downloadingFile}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {downloadingFile ? "Downloading..." : "Download"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Provide Feedback</h3>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleGenerateAIFeedback}
                    disabled={generatingAI || !submission?.content}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {generatingAI ? "Generating..." : "Generate AI Feedback"}
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
