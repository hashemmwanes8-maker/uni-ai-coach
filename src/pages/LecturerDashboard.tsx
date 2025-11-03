import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileCheck, Clock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const LecturerDashboard = () => {
  const submissions = [
    {
      id: 1,
      studentName: "Ahmad Hassan",
      studentId: "S2021001",
      assignment: "Research Paper: AI in Education",
      course: "Computer Science 301",
      submittedDate: "2025-11-03",
      status: "pending",
    },
    {
      id: 2,
      studentName: "Fatimah Ali",
      studentId: "S2021045",
      assignment: "Lab Report: Data Structures",
      course: "Computer Science 201",
      submittedDate: "2025-11-02",
      status: "pending",
    },
    {
      id: 3,
      studentName: "Mohammed Ibrahim",
      studentId: "S2021089",
      assignment: "Project Proposal",
      course: "Software Engineering 401",
      submittedDate: "2025-11-01",
      status: "reviewed",
      grade: "A",
    },
    {
      id: 4,
      studentName: "Aisha Rahman",
      studentId: "S2021123",
      assignment: "Essay: Islamic Studies",
      course: "Islamic Studies 101",
      submittedDate: "2025-11-02",
      status: "in-progress",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-accent/20 text-accent hover:bg-accent/30";
      case "in-progress":
        return "bg-secondary/20 text-secondary hover:bg-secondary/30";
      case "reviewed":
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
            <h1 className="text-2xl font-bold text-foreground">Lecturer Dashboard</h1>
            <p className="text-sm text-muted-foreground">Albukhary International University</p>
          </div>
          <Link to="/">
            <Button variant="outline">Logout</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Being reviewed</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Submissions</h2>
            <Button variant="outline" size="sm">
              <FileCheck className="mr-2 h-4 w-4" />
              View All
            </Button>
          </div>

          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{submission.studentName}</CardTitle>
                      <CardDescription>
                        {submission.studentId} • {submission.course}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                      {submission.grade && ` - ${submission.grade}`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">{submission.assignment}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      Submitted: {new Date(submission.submittedDate).toLocaleDateString()}
                    </div>
                    <div className="space-x-2">
                      {submission.status === "pending" && (
                        <Link to={`/lecturer/review/${submission.id}`}>
                          <Button>Review Submission</Button>
                        </Link>
                      )}
                      {submission.status === "reviewed" && (
                        <Link to={`/lecturer/review/${submission.id}`}>
                          <Button variant="outline">View Review</Button>
                        </Link>
                      )}
                      {submission.status === "in-progress" && (
                        <Link to={`/lecturer/review/${submission.id}`}>
                          <Button variant="secondary">Continue Review</Button>
                        </Link>
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

export default LecturerDashboard;
