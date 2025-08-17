import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardPageWrapper from "@/components/wrappers/DashboardPageWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, BookOpen, Search } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  register_number?: string;
  department?: string;
  section?: string;
  od_requests_count: number;
  approved_count: number;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, departmentFilter]);

  const fetchStudents = async () => {
    try {
      // Fetch students with their OD request counts
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (profilesError) {
        console.error('Error fetching students:', profilesError);
        return;
      }

      // Get OD request counts for each student
      const studentsWithCounts = await Promise.all(
        (profiles || []).map(async (student) => {
          const { data: allRequests } = await supabase
            .from('od_requests')
            .select('id, status')
            .eq('student_id', student.user_id);

          const odRequestsCount = allRequests?.length || 0;
          const approvedCount = allRequests?.filter(req => req.status === 'approved').length || 0;

          return {
            id: student.id,
            name: student.name,
            email: student.email,
            register_number: student.register_number,
            department: student.department,
            section: student.section,
            od_requests_count: odRequestsCount,
            approved_count: approvedCount,
          };
        })
      );

      setStudents(studentsWithCounts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.register_number && student.register_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(student => student.department === departmentFilter);
    }

    setFilteredStudents(filtered);
  };

  const departments = Array.from(new Set(students.map(s => s.department).filter(Boolean)));

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
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-muted-foreground">View and manage student information</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept || ""}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No students found</h3>
            <p className="text-muted-foreground text-center">
              {students.length === 0 
                ? "No students have registered yet."
                : "No students match your search criteria."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {student.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {student.email}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {student.od_requests_count} Total ODs
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {student.approved_count} Approved
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {student.register_number && (
                    <div>
                      <span className="text-sm font-medium">Register Number: </span>
                      <span className="text-sm text-muted-foreground">
                        {student.register_number}
                      </span>
                    </div>
                  )}
                  {student.department && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {student.department}
                      </span>
                    </div>
                  )}
                  {student.section && (
                    <div>
                      <span className="text-sm font-medium">Section: </span>
                      <span className="text-sm text-muted-foreground">
                        {student.section}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}