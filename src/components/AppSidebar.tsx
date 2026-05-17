import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tokenStore } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { PWAInstallButton } from "./PWAInstallButton";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Reviews",
    url: "/reviews",
    icon: ClipboardList,
  },
  {
    title: "Schedules",
    url: "/schedules",
    icon: Calendar,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const collapsed = state === "collapsed";

  const handleLogout = () => {
    tokenStore.clear();
    navigate("/auth");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  const NavItem = ({
    item,
    isActive,
  }: {
    item: (typeof navItems)[0];
    isActive: boolean;
  }) => {
    const content = (
      <div
        className={cn(
          "flex items-center rounded-xl transition-all duration-200 group/nav cursor-pointer",
          collapsed ? "justify-center p-2.5 mx-auto w-11 h-11" : "gap-3 px-3 py-2.5",
          isActive
            ? "bg-primary text-white shadow-md shadow-primary/20"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <item.icon
          className={cn(
            "h-[18px] w-[18px] flex-shrink-0 transition-colors",
            isActive ? "text-white" : "text-muted-foreground group-hover/nav:text-foreground"
          )}
        />
        {!collapsed && (
          <span className={cn("text-sm font-medium", isActive ? "text-white" : "")}>
            {item.title}
          </span>
        )}
      </div>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    variant = "default",
  }: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
  }) => {
    const content = (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center rounded-xl transition-all duration-200 w-full",
          collapsed ? "justify-center p-2.5 mx-auto w-11 h-11" : "gap-3 px-3 py-2.5",
          variant === "danger"
            ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        {variant === "default" ? (
          <div className="relative h-[18px] w-[18px] flex-shrink-0">
            <Sun className="h-[18px] w-[18px] absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="h-[18px] w-[18px] absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
        ) : (
          <Icon className="h-[18px] w-[18px] flex-shrink-0" />
        )}
        {!collapsed && <span className="text-sm font-medium">{label}</span>}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="font-medium">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-card/50 backdrop-blur-sm">
      <SidebarContent className={cn("flex flex-col h-full", collapsed ? "p-2" : "p-3")}>
        {/* Brand */}
        <div className={cn("mb-6", collapsed ? "py-3" : "px-1 py-4")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md shadow-primary/15 cursor-default">
                    <BrandLogo className="h-[18px] w-[18px] text-white" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="font-bold">
                MentorMeter
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md shadow-primary/15 flex-shrink-0">
                <BrandLogo className="h-[18px] w-[18px] text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gradient leading-tight">
                  MentorMeter
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Track & Manage
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink key={item.title} to={item.url}>
              {({ isActive }) => <NavItem item={item} isActive={isActive} />}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <SidebarFooter className="p-0 mt-auto space-y-1.5 border-t border-border/40 pt-3">
          <div className="px-1 py-1">
            <PWAInstallButton collapsed={collapsed} />
          </div>
          <ActionButton
            icon={Sun}
            label={theme === "dark" ? "Light Mode" : "Dark Mode"}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          />
          <ActionButton
            icon={LogOut}
            label="Logout"
            onClick={handleLogout}
            variant="danger"
          />
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
