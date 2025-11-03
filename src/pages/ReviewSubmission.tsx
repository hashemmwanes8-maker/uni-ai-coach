import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ReviewSubmission = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const submission = {
    studentName: "Ahmad Hassan",
    studentId: "S2021001",
    assignment: "Research Paper: AI in Education",
    course: "Computer Science 301",
    submittedDate: "2025-11-03",
    fileName: "ai_education_research.pdf",
    comments: "Please review my analysis of machine learning applications in adaptive learning systems."
  };

  const handleGenerateAIFeedback = () => {
    toast({
      title: "AI Feedback Generated",
      description: "AI-powered analysis has been added to the feedback section.",
    });
  };

  const handleSubmitReview = () => {
    toast({
      title: "Review Submitted",
      description: "Your feedback has been sent to the student.",
    });
  };

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
              <CardDescription>{submission.course}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Student Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {submission.studentName}</p>
                    <p><span className="font-medium">ID:</span> {submission.studentId}</p>
                    <p><span className="font-medium">Submitted:</span> {new Date(submission.submittedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Submitted File</h3>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">{submission.fileName}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                {submission.comments && (
                  <div>
                    <h3 className="font-semibold mb-2">Student Comments</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {submission.comments}
                    </p>
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
                  <Label htmlFor="grade">Grade</Label>
                  <Select>
                    <SelectTrigger id="grade" className="mt-2">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Excellent</SelectItem>
                      <SelectItem value="B">B - Good</SelectItem>
                      <SelectItem value="C">C - Satisfactory</SelectItem>
                      <SelectItem value="D">D - Needs Improvement</SelectItem>
                      <SelectItem value="F">F - Fail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="feedback">Detailed Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Provide constructive feedback on the student's work..."
                    className="mt-2"
                    rows={8}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline">Save as Draft</Button>
                  <Button onClick={handleSubmitReview}>Submit Review</Button>
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
                  <span className="text-muted-foreground">Plagiarism Check</span>
                  <Badge className="bg-success/20 text-success hover:bg-success/30">Passed</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Word Count</span>
                  <Badge variant="outline">3,245 words</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Citations</span>
                  <Badge variant="outline">12 sources</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Readability</span>
                  <Badge variant="outline">University Level</Badge>
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
