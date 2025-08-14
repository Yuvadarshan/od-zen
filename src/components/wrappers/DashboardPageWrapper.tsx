import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface DashboardPageWrapperProps {
  children: React.ReactNode;
}

export default function DashboardPageWrapper({ children }: DashboardPageWrapperProps) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}