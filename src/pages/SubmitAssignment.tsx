import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const SubmitAssignment = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string>("");

  const assignment = {
    title: "Research Paper: AI in Education",
    course: "Computer Science 301",
    dueDate: "2025-11-10",
    description: "Write a comprehensive research paper on artificial intelligence applications in education.",
    requirements: [
      "Minimum 3000 words",
      "APA citation format",
      "At least 10 peer-reviewed sources",
      "Include case studies and real-world examples"
    ]
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Assignment Submitted!",
      description: "Your assignment has been submitted successfully and is under review.",
    });
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

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{assignment.title}</CardTitle>
            <CardDescription>{assignment.course}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Assignment Description</h3>
              <p className="text-sm text-muted-foreground">{assignment.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {assignment.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
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
                  <Label htmlFor="comments">Additional Comments (Optional)</Label>
                  <Textarea
                    id="comments"
                    placeholder="Add any comments or notes for your lecturer..."
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                  <Button onClick={handleSubmit} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Submit Assignment
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
