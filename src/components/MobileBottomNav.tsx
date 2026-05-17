import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Home",
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

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.2)]">
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 relative group transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-primary rounded-b-full shadow-[0_2px_10px_rgba(var(--primary),0.5)]" />
              )}
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive ? "bg-primary/10 scale-110" : "group-hover:bg-accent"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "drop-shadow-md" : ""
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                isActive ? "font-bold" : ""
              )}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
