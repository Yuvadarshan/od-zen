import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Users, BookOpen } from "lucide-react";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    password: "",
    registerNumber: "",
    department: "",
    section: ""
  });

  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [isSignUp, setIsSignUp] = useState(true);

  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: studentForm.email,
        password: studentForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: studentForm.name,
            role: 'student',
            register_number: studentForm.registerNumber,
            department: studentForm.department,
            section: studentForm.section
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: teacherForm.email,
        password: teacherForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: teacherForm.name,
            role: 'teacher'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent, userType: 'student' | 'teacher') => {
    e.preventDefault();
    setIsLoading(true);

    const email = userType === 'student' ? studentForm.email : teacherForm.email;
    const password = userType === 'student' ? studentForm.password : teacherForm.password;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">OD Zen</h1>
          </div>
          <p className="text-lg text-muted-foreground">On-Duty Management System</p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Student
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teacher
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student {isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
                <CardDescription>
                  {isSignUp ? 'Create your student account' : 'Sign in to your student account'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={isSignUp ? handleStudentSignUp : (e) => handleSignIn(e, 'student')} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="student-name">Full Name</Label>
                      <Input
                        id="student-name"
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="student-email">College Email ID</Label>
                    <Input
                      id="student-email"
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      required
                    />
                  </div>

                  {isSignUp && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="register-number">Register Number</Label>
                        <Input
                          id="register-number"
                          value={studentForm.registerNumber}
                          onChange={(e) => setStudentForm({ ...studentForm, registerNumber: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Select onValueChange={(value) => setStudentForm({ ...studentForm, department: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                              <SelectItem value="ECE">Electronics & Communication</SelectItem>
                              <SelectItem value="EEE">Electrical & Electronics</SelectItem>
                              <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                              <SelectItem value="CIVIL">Civil Engineering</SelectItem>
                              <SelectItem value="IT">Information Technology</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="section">Section</Label>
                          <Select onValueChange={(value) => setStudentForm({ ...studentForm, section: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Section" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Section A</SelectItem>
                              <SelectItem value="B">Section B</SelectItem>
                              <SelectItem value="C">Section C</SelectItem>
                              <SelectItem value="D">Section D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button variant="outline" onClick={handleGoogleAuth} className="w-full">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teacher">
            <Card>
              <CardHeader>
                <CardTitle>Teacher {isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
                <CardDescription>
                  {isSignUp ? 'Create your teacher account' : 'Sign in to your teacher account'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={isSignUp ? handleTeacherSignUp : (e) => handleSignIn(e, 'teacher')} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="teacher-name">Full Name</Label>
                      <Input
                        id="teacher-name"
                        value={teacherForm.name}
                        onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="teacher-email">Email ID</Label>
                    <Input
                      id="teacher-email"
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacher-password">Password</Label>
                    <Input
                      id="teacher-password"
                      type="password"
                      value={teacherForm.password}
                      onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button variant="outline" onClick={handleGoogleAuth} className="w-full">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;