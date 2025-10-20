import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Schedules = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedules</h1>
        <p className="text-muted-foreground">View and manage mentorship schedules</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Schedule management features will be available here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section is under development. Check back soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedules;
