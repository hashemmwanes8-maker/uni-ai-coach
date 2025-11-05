import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, FileText, CheckCircle2, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const StudentDashboard = () => {
  const { user, loading, signOut } = useAuth("student");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    submitted: 0,
    graded: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      // First get all assignments
      const { data: allAssignments, error: assignmentsError } = await supabase
        .from("assignments")
        .select(`
          *,
          course:courses(
            title,
            code
          )
        `)
        .order("due_date", { ascending: true });

      if (assignmentsError) throw assignmentsError;

      // Then get student's submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", user?.id);

      if (submissionsError) throw submissionsError;

      // Merge data
      const assignmentsWithStatus = allAssignments?.map((assignment) => {
        const submission = submissions?.find((s) => s.assignment_id === assignment.id);
        return {
          ...assignment,
          submission,
          status: submission 
            ? (submission.grade ? "graded" : "submitted")
            : "pending",
        };
      }) || [];

      setAssignments(assignmentsWithStatus);

      // Calculate stats
      const pending = assignmentsWithStatus.filter((a) => a.status === "pending").length;
      const submitted = assignmentsWithStatus.filter((a) => a.status === "submitted").length;
      const graded = assignmentsWithStatus.filter((a) => a.status === "graded").length;

      setStats({ pending, submitted, graded });
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

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
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
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
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Assignments due</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <FileText className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.submitted}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Graded</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.graded}</div>
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
            {assignments.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No assignments available yet
                </CardContent>
              </Card>
            ) : (
              assignments.map((assignment) => (
                <Card key={assignment.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>
                          {assignment.course?.code} - {assignment.course?.title}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                        {assignment.submission?.grade && ` - ${assignment.submission.grade}`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {assignment.description || "No description provided"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                      <div className="space-x-2">
                        {assignment.status === "pending" && (
                          <Link to={`/student/submit/${assignment.id}`}>
                            <Button>Submit Assignment</Button>
                          </Link>
                        )}
                        {assignment.status === "graded" && (
                          <Link to={`/student/feedback/${assignment.submission.id}`}>
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
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
