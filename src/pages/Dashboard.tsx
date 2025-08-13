import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";

const Dashboard = () => {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      {profile?.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
    </DashboardLayout>
  );
};

export default Dashboard;