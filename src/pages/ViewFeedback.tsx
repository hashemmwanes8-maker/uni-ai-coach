import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const ViewFeedback = () => {
  const { id } = useParams();

  const feedback = {
    assignment: "Project Proposal",
    course: "Software Engineering 401",
    grade: "A",
    submittedDate: "2025-11-01",
    reviewedDate: "2025-11-03",
    lecturerName: "Dr. Sarah Ahmed",
    fileName: "project_proposal.pdf",
    feedback: `Excellent work on your project proposal! Your analysis of the problem domain is thorough and well-researched. The proposed solution demonstrates a clear understanding of software engineering principles.

Strengths:
• Clear project objectives and scope definition
• Comprehensive technical architecture design
• Realistic timeline with well-defined milestones
• Good consideration of potential risks and mitigation strategies

Areas for improvement:
• Consider adding more detail about the testing strategy
• The database schema could benefit from normalization analysis
• Include more specific user acceptance criteria

Overall, this is a strong foundation for your final year project. Looking forward to seeing the implementation phase.`,
    aiInsights: [
      "Strong technical writing with clear structure",
      "Excellent use of industry-standard terminology",
      "Well-balanced content across all sections",
      "Proper citation and referencing throughout"
    ]
  };

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

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{feedback.assignment}</CardTitle>
                  <CardDescription>{feedback.course}</CardDescription>
                </div>
                <Badge className="bg-success/20 text-success hover:bg-success/30 text-lg px-4 py-1">
                  Grade: {feedback.grade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Reviewed by {feedback.lecturerName} on {new Date(feedback.reviewedDate).toLocaleDateString()}</span>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Submitted File</h3>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">{feedback.fileName}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Lecturer Feedback</h3>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-sm text-foreground bg-muted/50 p-4 rounded-lg">
                    {feedback.feedback}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">AI-Powered Insights</h3>
                <ul className="space-y-2">
                  {feedback.aiInsights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Submitted</p>
                  <p className="font-medium">{new Date(feedback.submittedDate).toLocaleDateString()}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Reviewed</p>
                  <p className="font-medium">{new Date(feedback.reviewedDate).toLocaleDateString()}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Turnaround Time</p>
                  <p className="font-medium">2 days</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plagiarism</span>
                  <Badge className="bg-success/20 text-success hover:bg-success/30">0% Match</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Word Count</span>
                  <Badge variant="outline">2,856 words</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Citations</span>
                  <Badge variant="outline">15 sources</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Readability</span>
                  <Badge variant="outline">Excellent</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewFeedback;
