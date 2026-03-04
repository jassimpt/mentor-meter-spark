import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, Bell } from "lucide-react";

const Schedules = () => {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Schedules
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage mentorship schedules
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="h-20 w-20 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground leading-relaxed">
              Schedule management features are currently in development.
              You'll soon be able to plan, organize, and track your
              mentorship sessions right here.
            </p>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary/60" />
                Session Planning
              </span>
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary/60" />
                Reminders
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedules;
