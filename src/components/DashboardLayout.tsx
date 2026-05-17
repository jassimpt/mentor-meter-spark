import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/20 pb-16 md:pb-0">
        <div className="hidden md:flex">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader />
          <header className="hidden md:flex h-14 border-b border-border/40 items-center px-6 bg-card/60 backdrop-blur-md sticky top-0 z-30">
            <SidebarTrigger className="hover:bg-accent rounded-lg p-2 -ml-2 transition-colors" />
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
