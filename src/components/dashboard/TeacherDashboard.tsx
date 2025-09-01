import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Users, CheckSquare, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AttendanceCalendar } from "@/components/teacher/AttendanceCalendar";
import { EventCreateDialog } from "@/components/teacher/EventCreateDialog";

interface ODRequest {
  id: string;
  od_type: string;
  title: string;
  od_date?: string;
  period?: string;
  timings?: string;
  event_name?: string;
  status: string;
  created_at: string;
  students: {
    name: string;
    register_number: string;
    department: string;
    section: string;
  };
}

const TeacherDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<ODRequest[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch pending requests with student details
      const { data: pending, error: pendingError } = await supabase
        .from('od_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (pendingError) throw pendingError;

      // Fetch student details for each request
      const requestsWithStudents = await Promise.all(
        (pending || []).map(async (request) => {
          const { data: student } = await supabase
            .from('students')
            .select('name, register_number, department, section')
            .eq('user_id', request.student_id)
            .single();

          return {
            ...request,
            students: student || { name: 'Unknown', register_number: '', department: '', section: '' }
          };
        })
      );

      setPendingRequests(requestsWithStudents);

      // Fetch statistics
      const { data: allRequests, error: statsError } = await supabase
        .from('od_requests')
        .select('status');

      if (statsError) throw statsError;

      const { data: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('id', { count: 'exact' });

      if (studentsError) throw studentsError;

      const totalRequests = allRequests?.length || 0;
      const pendingCount = allRequests?.filter(r => r.status === 'pending').length || 0;
      const approvedCount = allRequests?.filter(r => r.status === 'approved').length || 0;

      setStats({
        totalRequests,
        pendingRequests: pendingCount,
        approvedRequests: approvedCount,
        totalStudents: studentsCount?.length || 0
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('od_requests')
        .update({
          status: action,
          approved_by: (profile?.data as any)?.user_id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${action} successfully`,
      });

      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome, {(profile?.data as any)?.name}!</h1>
        <p className="text-muted-foreground">Teacher Dashboard - Manage student OD requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage OD requests efficiently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/dashboard/pending-requests')} 
              className="w-full justify-start"
            >
              <Clock className="mr-2 h-4 w-4" />
              Review Pending ({stats.pendingRequests})
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('src/pages/ApprovedODs')}
              className="w-full justify-start"
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              View Approved ODs
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/students')} 
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              Student Directory
            </Button>
            <EventCreateDialog onEventCreated={fetchData} />
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Pending Requests</CardTitle>
            <CardDescription>Quick approval for recent requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No pending requests at the moment.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{request.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.students?.name || 'Unknown'} • {request.students?.register_number || 'N/A'} • {request.students?.department || 'N/A'}-{request.students?.section || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.od_type === 'daily' ? 'Daily OD' : 'Event OD'} • 
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-yellow-800 border-yellow-200">
                        Pending
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleQuickAction(request.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleQuickAction(request.id, 'rejected')}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigate('/dashboard/request/${request.id}')}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Calendar */}
      <AttendanceCalendar />
    </div>
  );
};

export default TeacherDashboard;