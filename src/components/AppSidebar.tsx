import { LayoutDashboard, ClipboardList, Calendar, LogOut, Sun, Moon, Sparkles } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const items = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboard,
    description: "Overview & stats"
  },
  { 
    title: "Reviews", 
    url: "/reviews", 
    icon: ClipboardList,
    description: "Manage reviews"
  },
  { 
    title: "Schedules", 
    url: "/schedules", 
    icon: Calendar,
    description: "View schedules"
  },
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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="p-4 space-y-4">
        {/* Brand Section */}
        {!collapsed && (
          <div className="px-2 py-4 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                MentorMeter
              </h2>
            </div>
            <p className="text-xs text-muted-foreground px-1">Track & Manage Reviews</p>
          </div>
        )}

        {/* Navigation Cards */}
        <nav className="space-y-2">
          {items.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) => "block"}
            >
              {({ isActive }) => (
                <Card 
                  className={cn(
                    "p-3 transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer border-2",
                    isActive 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                      : "hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                      isActive 
                        ? "bg-primary-foreground/20" 
                        : "bg-primary/10"
                    )}>
                      <item.icon className={cn(
                        "h-5 w-5",
                        isActive ? "text-primary-foreground" : "text-primary"
                      )} />
                    </div>
                    {!collapsed && (
                      <div className="flex-1">
                        <p className={cn(
                          "font-semibold text-sm",
                          isActive ? "text-primary-foreground" : ""
                        )}>
                          {item.title}
                        </p>
                        <p className={cn(
                          "text-xs",
                          isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </NavLink>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        {/* Theme Toggle Card */}
        <Card 
          className="p-3 cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-md hover:border-primary/50"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center relative">
              <Sun className="h-5 w-5 text-primary absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="h-5 w-5 text-primary absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </div>
            {!collapsed && (
              <div className="flex-1">
                <p className="font-semibold text-sm">Theme</p>
                <p className="text-xs text-muted-foreground">Toggle mode</p>
              </div>
            )}
          </div>
        </Card>

        {/* Logout Card */}
        <Card 
          className="p-3 cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-md hover:border-destructive/50 hover:bg-destructive/5"
          onClick={handleLogout}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            {!collapsed && (
              <div className="flex-1">
                <p className="font-semibold text-sm">Logout</p>
                <p className="text-xs text-muted-foreground">Sign out</p>
              </div>
            )}
          </div>
        </Card>
      </SidebarFooter>
    </Sidebar>
  );
}
