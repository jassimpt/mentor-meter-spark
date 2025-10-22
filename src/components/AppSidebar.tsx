import { LayoutDashboard, ClipboardList, Calendar, LogOut, Sun, Moon } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Reviews", url: "/reviews", icon: ClipboardList },
  { title: "Schedules", url: "/schedules", icon: Calendar },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message,
      });
    } else {
      navigate("/auth");
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold">
            {!collapsed && "Mentor Meter"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="w-full justify-start"
        >
          <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 ml-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {!collapsed && <span className="ml-6">Toggle theme</span>}
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
