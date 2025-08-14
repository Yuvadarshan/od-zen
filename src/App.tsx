import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./pages/Dashboard";
import NewRequest from "./pages/NewRequest";
import MyRequests from "./pages/MyRequests";
import Attendance from "./pages/Attendance";
import PendingRequests from "./pages/PendingRequests";
import ApprovedODs from "./pages/ApprovedODs";
import Students from "./pages/Students";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/new-request" element={<NewRequest />} />
            <Route path="/dashboard/my-requests" element={<MyRequests />} />
            <Route path="/dashboard/attendance" element={<Attendance />} />
            <Route path="/dashboard/pending-requests" element={<PendingRequests />} />
            <Route path="/dashboard/approved-ods" element={<ApprovedODs />} />
            <Route path="/dashboard/students" element={<Students />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
