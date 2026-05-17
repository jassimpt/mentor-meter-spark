import { BrandLogo } from "@/components/BrandLogo";
import { LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tokenStore } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

export function MobileHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    tokenStore.clear();
    navigate("/auth");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 h-16 flex items-center justify-between px-4">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md shadow-primary/15">
          <BrandLogo className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gradient tracking-tight">MentorMeter</h2>
      </div>
      
      <div className="flex items-center gap-2">
        
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full bg-accent/50 hover:bg-accent text-foreground"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
