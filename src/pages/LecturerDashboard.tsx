import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileCheck, Clock, BookOpen, LogOut, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const LecturerDashboard = () => {
  const { user, loading, signOut } = useAuth("lecturer");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      // First get courses taught by this lecturer
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id")
        .eq("lecturer_id", user?.id);

      if (coursesError) throw coursesError;

      const courseIds = courses?.map(c => c.id) || [];

      if (courseIds.length === 0) {
        setSubmissions([]);
        setStats({ total: 0, pending: 0, inProgress: 0, completed: 0 });
        setLoadingData(false);
        return;
      }

      // Then get assignments for those courses
      const { data: assignments, error: assignmentsError } = await supabase
        .from("assignments")
        .select("id")
        .in("course_id", courseIds);

      if (assignmentsError) throw assignmentsError;

      const assignmentIds = assignments?.map(a => a.id) || [];

      if (assignmentIds.length === 0) {
        setSubmissions([]);
        setStats({ total: 0, pending: 0, inProgress: 0, completed: 0 });
        setLoadingData(false);
        return;
      }

      // Finally get submissions for those assignments
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
          student:profiles(
            full_name,
            email
          )
        `)
        .in("assignment_id", assignmentIds)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter((s) => !s.grade).length || 0;
      const completed = data?.filter((s) => s.grade).length || 0;
      
      setStats({ total, pending, inProgress: 0, completed });
    } catch (error: any) {
      // Silent fail - just show empty state
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

  const getStatusColor = (hasGrade: boolean) => {
    if (hasGrade) {
      return "bg-success/20 text-success hover:bg-success/30";
    }
    return "bg-accent/20 text-accent hover:bg-accent/30";
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
          <div className="flex gap-2">
            <div className="flex gap-2">
              <Link to="/lecturer/create-course">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </Link>
              <Link to="/lecturer/create-assignment">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              </Link>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
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
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Needs review</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Graded</p>
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
            {submissions.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No submissions yet
                </CardContent>
              </Card>
            ) : (
              submissions.map((submission) => (
                <Card key={submission.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">
                          {submission.student?.full_name || "Unknown Student"}
                        </CardTitle>
                        <CardDescription>
                          {submission.student?.email} • {submission.assignment?.course?.code} - {submission.assignment?.course?.title}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(!!submission.grade)}>
                        {submission.grade ? `Graded - ${submission.grade}` : "Pending Review"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium mb-2">{submission.assignment?.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                      </div>
                      <div className="space-x-2">
                        <Link to={`/lecturer/review/${submission.id}`}>
                          <Button variant={submission.grade ? "outline" : "default"}>
                            {submission.grade ? "View Review" : "Review Submission"}
                          </Button>
                        </Link>
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

export default LecturerDashboard;
