import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardPageWrapper from "@/components/wrappers/DashboardPageWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, Circle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ApprovedOD {
  id: string;
  title: string;
  event_name: string;
  od_date: string;
  timings: string;
  attendance?: {
    id: string;
    date: string;
    is_present: boolean;
  }[];
}

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [approvedODs, setApprovedODs] = useState<ApprovedOD[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedODs();
  }, [user]);

  const fetchApprovedODs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('od_requests')
        .select(`
          id,
          title,
          event_name,
          od_date,
          timings,
          attendance (
            id,
            date,
            is_present
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'approved')
        .order('od_date', { ascending: false });

      if (error) {
        console.error('Error fetching approved ODs:', error);
        return;
      }

      setApprovedODs(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (odRequestId: string, date: string, isPresent: boolean) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .insert([
          {
            od_request_id: odRequestId,
            date,
            is_present: isPresent,
          },
        ]);

      if (error) {
        console.error('Error marking attendance:', error);
        toast({
          title: "Error",
          description: "Failed to mark attendance",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Attendance marked as ${isPresent ? 'present' : 'absent'}`,
      });

      fetchApprovedODs();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const hasAttendanceForDate = (od: ApprovedOD, date: string) => {
    return od.attendance?.some(att => att.date === date);
  };

  const getAttendanceStatus = (od: ApprovedOD, date: string) => {
    const attendance = od.attendance?.find(att => att.date === date);
    return attendance?.is_present;
  };

  if (loading) {
    return (
      <DashboardPageWrapper>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Attendance Tracking</h1>
        <p className="text-muted-foreground">Mark your attendance for approved OD requests</p>
      </div>

      {approvedODs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No approved ODs</h3>
            <p className="text-muted-foreground text-center">
              You don't have any approved OD requests that require attendance tracking.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {approvedODs.map((od) => {
            const odDate = od.od_date;
            const hasMarkedAttendance = hasAttendanceForDate(od, odDate);
            const attendanceStatus = getAttendanceStatus(od, odDate);

            return (
              <Card key={od.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{od.title}</CardTitle>
                      <CardDescription>{od.event_name}</CardDescription>
                    </div>
                    {hasMarkedAttendance && (
                      <Badge
                        className={
                          attendanceStatus
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {attendanceStatus ? "Present" : "Absent"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(od.od_date), "PPP")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Timings: </span>
                      <span className="text-sm text-muted-foreground">{od.timings}</span>
                    </div>
                  </div>

                  {!hasMarkedAttendance ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => markAttendance(od.id, odDate, true)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark Present
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => markAttendance(od.id, odDate, false)}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Mark Absent
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Circle className="h-4 w-4" />
                      Attendance already marked for this date
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}