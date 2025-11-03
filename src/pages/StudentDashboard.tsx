import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, FileText, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const assignments = [
    {
      id: 1,
      title: "Research Paper: AI in Education",
      course: "Computer Science 301",
      dueDate: "2025-11-10",
      status: "pending",
      description: "Write a comprehensive research paper on artificial intelligence applications in education."
    },
    {
      id: 2,
      title: "Lab Report: Data Structures",
      course: "Computer Science 201",
      dueDate: "2025-11-08",
      status: "submitted",
      description: "Complete lab report on binary trees and graph algorithms implementation."
    },
    {
      id: 3,
      title: "Essay: Islamic Studies",
      course: "Islamic Studies 101",
      dueDate: "2025-11-15",
      status: "pending",
      description: "Analytical essay on contemporary Islamic thought and philosophy."
    },
    {
      id: 4,
      title: "Project Proposal",
      course: "Software Engineering 401",
      dueDate: "2025-11-05",
      status: "graded",
      grade: "A",
      description: "Final year project proposal with implementation timeline."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-accent/20 text-accent hover:bg-accent/30";
      case "submitted":
        return "bg-secondary/20 text-secondary hover:bg-secondary/30";
      case "graded":
        return "bg-success/20 text-success hover:bg-success/30";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground">Albukhary International University</p>
          </div>
          <Link to="/">
            <Button variant="outline">Logout</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Assignments due</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <FileText className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Graded</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Assignments</h2>
            <Button variant="outline" size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              View All Courses
            </Button>
          </div>

          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>{assignment.course}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                      {assignment.grade && ` - ${assignment.grade}`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                    <div className="space-x-2">
                      {assignment.status === "pending" && (
                        <Link to={`/student/submit/${assignment.id}`}>
                          <Button>Submit Assignment</Button>
                        </Link>
                      )}
                      {assignment.status === "graded" && (
                        <Link to={`/student/feedback/${assignment.id}`}>
                          <Button variant="outline">View Feedback</Button>
                        </Link>
                      )}
                      {assignment.status === "submitted" && (
                        <Button variant="outline" disabled>
                          Under Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
