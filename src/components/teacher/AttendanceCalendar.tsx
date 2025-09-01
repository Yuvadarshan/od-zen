import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CalendarDays, User } from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  is_present: boolean;
  od_request: {
    title: string;
    student_id: string;
  };
  student: {
    name: string;
    register_number: string;
    department: string;
    section: string;
  };
}

export function AttendanceCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [attendanceDates, setAttendanceDates] = useState<Date[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDailyAttendance(selectedDate);
    }
  }, [selectedDate, attendanceData]);

  const fetchAttendanceData = async () => {
    try {
      const { data: attendance, error } = await supabase
        .from('attendance')
        .select(`
          id,
          date,
          is_present,
          od_request_id,
          od_requests (
            title,
            student_id
          )
        `)
        .eq('is_present', true)
        .order('date', { ascending: false });

      if (error) throw error;

      const attendanceWithStudents = await Promise.all(
        (attendance || []).map(async (record) => {
          const { data: student } = await supabase
            .from('students')
            .select('name, register_number, department, section')
            .eq('user_id', record.od_requests?.student_id)
            .single();

          return {
            ...record,
            od_request: record.od_requests!,
            student: student || { name: 'Unknown', register_number: '', department: '', section: '' }
          };
        })
      );

      setAttendanceData(attendanceWithStudents);
      
      // Extract unique dates for calendar highlighting
      const dates = attendanceWithStudents.map(record => new Date(record.date));
      setAttendanceDates(dates);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyAttendance = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dailyRecords = attendanceData.filter(record => record.date === dateString);
    setDailyAttendance(dailyRecords);
  };

  const isAttendanceDate = (date: Date) => {
    return attendanceDates.some(attendanceDate => 
      format(attendanceDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Attendance Calendar
          </CardTitle>
          <CardDescription>Loading attendance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Attendance Calendar
        </CardTitle>
        <CardDescription>
          Click on highlighted dates to view student attendance records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasAttendance: attendanceDates
              }}
              modifiersStyles={{
                hasAttendance: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold'
                }
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDate ? format(selectedDate, 'PPPP') : 'Select a date'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {dailyAttendance.length} student(s) marked present
              </p>
            </div>

            {dailyAttendance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance records for this date</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {dailyAttendance.map((record) => (
                  <Dialog key={record.id}>
                    <DialogTrigger asChild>
                      <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{record.student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {record.student.register_number} • {record.student.department}-{record.student.section}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Present
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          OD: {record.od_request?.title}
                        </p>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Attendance Details</DialogTitle>
                        <DialogDescription>
                          Student attendance information for {format(selectedDate!, 'PPPP')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Student Name</label>
                          <p className="text-sm text-muted-foreground">{record.student.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Register Number</label>
                          <p className="text-sm text-muted-foreground">{record.student.register_number}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Department & Section</label>
                          <p className="text-sm text-muted-foreground">
                            {record.student.department} - {record.student.section}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">OD Request</label>
                          <p className="text-sm text-muted-foreground">{record.od_request?.title}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <Badge className="bg-green-100 text-green-800 border-green-200 ml-2">
                            Present
                          </Badge>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}