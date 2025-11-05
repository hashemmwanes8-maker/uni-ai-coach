import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import CreateCourse from "./pages/CreateCourse";
import CreateAssignment from "./pages/CreateAssignment";
import SubmitAssignment from "./pages/SubmitAssignment";
import ReviewSubmission from "./pages/ReviewSubmission";
import ViewFeedback from "./pages/ViewFeedback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/submit/:id" element={<SubmitAssignment />} />
          <Route path="/student/feedback/:id" element={<ViewFeedback />} />
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
          <Route path="/lecturer/create-course" element={<CreateCourse />} />
          <Route path="/lecturer/create-assignment" element={<CreateAssignment />} />
          <Route path="/lecturer/review/:id" element={<ReviewSubmission />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
