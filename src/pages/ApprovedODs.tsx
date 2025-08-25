import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardPageWrapper from "@/components/wrappers/DashboardPageWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, ExternalLink, User } from "lucide-react";
import { format } from "date-fns";

interface ApprovedOD {
  id: string;
  title: string;
  od_type: string;
  event_name: string;
  od_date: string;
  timings: string;
  period?: string;
  attachment_url?: string;
  approved_at: string;
  students: {
    name: string;
    email: string;
    register_number?: string;
    department?: string;
    section?: string;
  };
  attendance: {
    date: string;
    is_present: boolean;
  }[];
}

export default function ApprovedODs() {
  const [approvedODs, setApprovedODs] = useState<ApprovedOD[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedODs();
  }, []);

  const fetchApprovedODs = async () => {
    try {
      const { data, error } = await supabase
        .from('od_requests')
        .select(`
          *,
          students!od_requests_student_id_fkey (
            name,
            email,
            register_number,
            department,
            section
          ),
          attendance (
            date,
            is_present
          )
        `)
        .eq('status', 'approved')
        .order('approved_at', { ascending: false });

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

  const getAttendanceStatus = (od: ApprovedOD) => {
    const attendance = od.attendance.find(att => att.date === od.od_date);
    if (!attendance) return "Not Marked";
    return attendance.is_present ? "Present" : "Absent";
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-200";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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
        <h1 className="text-2xl font-bold">Approved OD Requests</h1>
        <p className="text-muted-foreground">View all approved OD requests and attendance status</p>
      </div>

      {approvedODs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No approved ODs</h3>
            <p className="text-muted-foreground text-center">
              No OD requests have been approved yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {approvedODs.map((od) => {
            const attendanceStatus = getAttendanceStatus(od);
            
            return (
              <Card key={od.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{od.title}</CardTitle>
                      <CardDescription>{od.event_name}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Approved
                      </Badge>
                      <Badge className={getAttendanceColor(attendanceStatus)}>
                        {attendanceStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {od.students.name}
                        {od.students.register_number && (
                          <span className="text-muted-foreground ml-2">
                            ({od.students.register_number})
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Department: </span>
                      <span className="text-sm text-muted-foreground">
                        {od.students.department} - {od.students.section}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(od.od_date), "PPP")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{od.timings}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium">Type: </span>
                      <span className="text-sm text-muted-foreground capitalize">
                        {od.od_type}
                      </span>
                    </div>
                    {od.period && (
                      <div>
                        <span className="text-sm font-medium">Period: </span>
                        <span className="text-sm text-muted-foreground">
                          {od.period}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Approved {format(new Date(od.approved_at), "PPp")}
                    </span>
                    {od.attachment_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(od.attachment_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Attachment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}