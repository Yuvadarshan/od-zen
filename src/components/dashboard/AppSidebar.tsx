import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  Users,
  BookOpen,
} from "lucide-react";

const studentMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "New Request", url: "/dashboard/new-request", icon: FileText },
  { title: "My Requests", url: "/dashboard/my-requests", icon: CheckSquare },
  { title: "Attendance", url: "/dashboard/attendance", icon: Calendar },
];

const teacherMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pending Requests", url: "/dashboard/pending-requests", icon: FileText },
  { title: "Approved ODs", url: "/dashboard/approved-ods", icon: CheckSquare },
  { title: "Students", url: "/dashboard/students", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const menuItems = profile?.role === 'student' ? studentMenuItems : teacherMenuItems;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            {!collapsed && (
              <span className="font-bold text-xl text-primary">OD Zen</span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>
            {profile?.role === 'student' ? 'Student Portal' : 'Teacher Portal'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}