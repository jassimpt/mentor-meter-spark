import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Calendar, Star } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Reviews",
      value: "24",
      change: "+12%",
      icon: Star,
      color: "text-blue-600",
    },
    {
      title: "Active Mentors",
      value: "8",
      change: "+3",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Upcoming Sessions",
      value: "12",
      change: "This week",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Average Score",
      value: "4.5",
      change: "+0.3",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest mentorship activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Review Session {i}</p>
                    <p className="text-sm text-muted-foreground">Completed 2 days ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">4.5</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Performance overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm font-bold">92%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "92%" }}></div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium">Response Time</span>
                <span className="text-sm font-bold">2.5h</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: "75%" }}></div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium">Satisfaction</span>
                <span className="text-sm font-bold">98%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: "98%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
