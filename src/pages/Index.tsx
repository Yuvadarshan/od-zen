import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, GraduationCap, Users, CheckSquare, Calendar } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">OD Zen</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            On-Duty Management
            <span className="text-primary"> Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your college's on-duty process with our comprehensive management system. 
            Students can request ODs easily, teachers can approve efficiently.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything You Need for OD Management
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive features for both students and teachers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Student Portal</h3>
            <p className="text-muted-foreground text-sm">
              Easy OD request submission for daily duties and events
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Teacher Dashboard</h3>
            <p className="text-muted-foreground text-sm">
              Efficient approval system with detailed student information
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Request Management</h3>
            <p className="text-muted-foreground text-sm">
              Track all requests with real-time status updates
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Attendance Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Mark and track attendance for approved OD requests
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of students and teachers already using OD Zen
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Sign Up Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 OD Zen. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
