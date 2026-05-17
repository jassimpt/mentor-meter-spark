import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  FileText,
  Calendar,
  TrendingUp,
  Star,
  Sparkles,
  ArrowUpRight,
  ClipboardList,
  History,
  CheckCircle,
  Clock as ClockIcon,
  Bell,
  XCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  subMonths,
  isPast,
  isToday,
  parseISO,
} from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PWAInstallButton } from "@/components/PWAInstallButton";

interface ReviewData {
  id: string;
  user_id: string;
  mentor_name: string;
  intern_name: string;
  review_date: string;
  review_topic: string;
  review_score: number;
  created_at: string;
  updated_at: string;
}

interface ScheduleData {
  id: string;
  user_id: string;
  mentor_name: string;
  intern_name: string;
  schedule_date: string;
  schedule_time: string;
  session_topic: string;
  meet_link: string | null;
  schedule_status: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentRate, setPaymentRate] = useState("");
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [completeScheduleData, setCompleteScheduleData] = useState<ScheduleData | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedRate = localStorage.getItem("perReviewPayment");
    if (savedRate) {
      setCurrentRate(parseFloat(savedRate));
    }
    fetchReviews();
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await api.get<ScheduleData[]>("/api/schedules");
      // Sort ascending by date for dashboard display
      data.sort((a, b) => a.schedule_date.localeCompare(b.schedule_date));
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await api.get<ReviewData[]>("/api/reviews");
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberClick = (num: string) => {
    setPaymentRate((prev) => prev + num);
  };

  const handleClear = () => setPaymentRate("");
  const handleDelete = () => setPaymentRate((prev) => prev.slice(0, -1));

  const handleSubmit = () => {
    const rate = parseFloat(paymentRate);
    if (!isNaN(rate) && rate > 0) {
      localStorage.setItem("perReviewPayment", rate.toString());
      setCurrentRate(rate);
      setIsPaymentModalOpen(false);
      setPaymentRate("");
    }
  };

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);
  const prevMonthDate = subMonths(today, 1);
  const prevMonthStart = startOfMonth(prevMonthDate);
  const prevMonthEnd = endOfMonth(prevMonthDate);

  const reviewsThisMonth = reviews.filter((r) => {
    const d = new Date(r.review_date);
    return d >= monthStart && d <= monthEnd;
  });

  const reviewsToday = reviews.filter((r) => {
    const d = new Date(r.review_date);
    return d >= dayStart && d <= dayEnd;
  });

  const reviewsPrevMonth = reviews.filter((r) => {
    const d = new Date(r.review_date);
    return d >= prevMonthStart && d <= prevMonthEnd;
  });

  const prevMonthEarnings = reviewsPrevMonth.length * currentRate;

  const stats = [
    {
      title: "Monthly Reviews",
      value: reviewsThisMonth.length.toString(),
      subtitle: `${reviewsThisMonth.length} reviews`,
      icon: FileText,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      trend: "+12%",
    },
    {
      title: "Monthly Earnings",
      value: `₹${(reviewsThisMonth.length * currentRate).toLocaleString("en-IN")}`,
      subtitle: `₹${currentRate}/review`,
      icon: DollarSign,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      trend: "+8%",
    },
    {
      title: "Today's Reviews",
      value: reviewsToday.length.toString(),
      subtitle: format(today, "MMM dd"),
      icon: Calendar,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      trend: null,
    },
    {
      title: "Today's Earnings",
      value: `₹${(reviewsToday.length * currentRate).toLocaleString("en-IN")}`,
      subtitle: `${reviewsToday.length} reviews`,
      icon: TrendingUp,
      iconBg: "bg-teal-500/10",
      iconColor: "text-teal-600",
      trend: null,
    },
  ];

  const recentReviews = reviews.slice(0, 5);

  // Generate chart data for current month up to today
  const chartData: any[] = [];
  const dataMap = new Map();

  const loopDate = new Date(monthStart);
  while (loopDate <= today) {
    const dateStr = format(loopDate, "MMM dd");
    dataMap.set(dateStr, { date: dateStr, reviews: 0, earnings: 0 });
    loopDate.setDate(loopDate.getDate() + 1);
  }

  reviewsThisMonth.forEach((r) => {
    const d = new Date(r.review_date);
    if (d <= today) {
      const dateStr = format(d, "MMM dd");
      if (dataMap.has(dateStr)) {
        const item = dataMap.get(dateStr);
        item.reviews += 1;
        item.earnings += currentRate;
      }
    }
  });

  Array.from(dataMap.values()).forEach((v) => chartData.push(v));

  const chartConfig = {
    reviews: { label: "Reviews", color: "hsl(221, 83%, 53%)" },
    earnings: { label: "Earnings (₹)", color: "#10b981" },
  } satisfies ChartConfig;

  // Schedules reminders logic
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/schedules/${id}/status`, { status: newStatus });
      fetchSchedules();

      if (newStatus === "cancelled") {
        toast({
          title: "Schedule Cancelled",
          description: "The schedule has been cancelled.",
        });
      }
    } catch (error: any) {
      console.error(`Error updating status to ${newStatus}:`, error);
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message,
      });
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Meet link copied to clipboard",
    });
  };

  const handleCompleteSchedule = async () => {
    if (!completeScheduleData) return;
    setIsSubmittingReview(true);

    try {
      await api.post(`/api/schedules/${completeScheduleData.id}/complete`, {
        review_score: reviewScore,
      });

      toast({
        title: "Schedule Completed",
        description: "The schedule has been marked as completed and saved as a review.",
      });

      setCompleteScheduleData(null);
      setReviewScore(5);
      fetchSchedules();
      fetchReviews();
    } catch (error: any) {
      console.error("Error completing schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const pendingSchedules = schedules.filter(s => s.schedule_status === "pending");
  const upcomingSchedules = pendingSchedules.filter(s => {
    const scheduleDateTime = new Date(`${s.schedule_date}T${s.schedule_time}`);
    if (isPast(scheduleDateTime)) return false;
    if (isToday(scheduleDateTime)) return true;
    return false;
  }).slice(0, 2);

  const passedPendingSchedules = pendingSchedules.filter(s => {
    const scheduleDateTime = new Date(`${s.schedule_date}T${s.schedule_time}`);
    return isPast(scheduleDateTime);
  }).slice(0, 2);

  return (
    <div className="space-y-4 md:space-y-8 max-w-7xl pb-safe">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary mb-1">
            {format(today, "EEEE, MMMM d")}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here's what's happening with your mentorship this month.
          </p>
        </div>
        <Dialog
          open={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 rounded-xl h-10 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">₹{currentRate}/review</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[2rem] max-md:bottom-0 max-md:top-auto max-md:translate-y-0 max-md:rounded-t-[2rem] max-md:rounded-b-none max-md:w-full max-md:max-w-none max-md:slide-in-from-bottom-5 max-md:animate-in p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Set Payment Rate
              </DialogTitle>
              <DialogDescription>
                Enter your payment rate per review
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="text-center">
                <div className="text-4xl font-bold h-16 flex items-center justify-center border border-border/50 rounded-2xl bg-muted/30">
                  ₹{paymentRate || "0"}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    size="lg"
                    onClick={() => handleNumberClick(num.toString())}
                    className="text-lg h-12 rounded-xl hover:bg-primary/5 hover:border-primary/30 font-medium transition-colors"
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClear}
                  className="text-lg h-12 rounded-xl text-destructive hover:bg-destructive/5 hover:border-destructive/30 font-medium"
                >
                  C
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleNumberClick("0")}
                  className="text-lg h-12 rounded-xl hover:bg-primary/5 hover:border-primary/30 font-medium"
                >
                  0
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDelete}
                  className="text-lg h-12 rounded-xl hover:bg-primary/5 hover:border-primary/30 font-medium"
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleNumberClick(".")}
                  className="text-lg h-12 rounded-xl col-span-3 hover:bg-primary/5 hover:border-primary/30 font-medium"
                >
                  .
                </Button>
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full h-11 bg-gradient-primary hover:opacity-90 text-white rounded-xl font-semibold shadow-md shadow-primary/15"
                size="lg"
              >
                Save Rate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Action Required Alert Banner */}
      {(upcomingSchedules.length > 0 || passedPendingSchedules.length > 0) && (
        <div className="rounded-[1.25rem] border border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 shadow-sm">
          <div className="p-4 sm:p-5">
            <div className="flex gap-3 items-center mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-blue-950 dark:text-blue-300 tracking-tight">
                  Action Required
                </h2>
                <p className="text-xs font-medium text-blue-700/80 dark:text-blue-400/80 mt-0.5">
                  You have pending schedules that need your attention
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingSchedules.map(schedule => (
                <div key={schedule.id} className="p-3.5 rounded-xl border border-blue-500/10 bg-white/60 dark:bg-background/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                          Upcoming Session
                        </span>
                      </div>
                      <p className="text-sm font-semibold truncate text-foreground">{schedule.intern_name}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-muted-foreground">
                        <ClockIcon className="h-3.5 w-3.5 text-blue-500/70" />
                        <span>{format(parseISO(`1970-01-01T${schedule.schedule_time}`), "hh:mm a")}</span>
                      </div>
                    </div>
                    {schedule.meet_link && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={schedule.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center justify-center shadow-sm transition-colors"
                        >
                          Join Meet
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(schedule.meet_link as string)}
                          className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground border-blue-500/10 hover:border-blue-500/30 hover:bg-white/50"
                          title="Copy link"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {passedPendingSchedules.map(schedule => (
                <div key={schedule.id} className="p-3.5 rounded-xl border border-primary/10 bg-white/60 dark:bg-background/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                          Session Passed
                        </span>
                      </div>
                      <p className="text-sm font-semibold truncate text-foreground">{schedule.intern_name}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" />
                        <span>{format(parseISO(schedule.schedule_date), "MMM dd")} • {format(parseISO(`1970-01-01T${schedule.schedule_time}`), "hh:mm a")}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {schedule.meet_link && (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={schedule.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-7 px-2.5 rounded-md bg-background border border-border/50 hover:bg-muted text-[10px] font-medium flex items-center text-foreground transition-colors"
                          >
                            Join Meet
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(schedule.meet_link as string)}
                            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
                            title="Copy link"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => setCompleteScheduleData(schedule)}
                          className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white shadow-sm transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Done</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusUpdate(schedule.id, "cancelled")}
                          className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
                          title="Cancel Schedule"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Previous Month Performance */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 md:gap-4 mb-2">
        <div className="flex items-center justify-between p-3 md:p-4 rounded-[1rem] md:rounded-[1.25rem] border border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
              <History className="h-4.5 w-4.5 md:h-4 md:w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] md:text-sm font-medium text-foreground truncate">Prev. Month</p>
              <p className="text-[9px] md:text-xs text-muted-foreground truncate">{format(prevMonthDate, "MMM yyyy")}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm md:text-xl font-bold tracking-tight">{reviewsPrevMonth.length}</p>
            <p className="text-[9px] md:text-xs font-medium text-muted-foreground">Reviews</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 md:p-4 rounded-[1rem] md:rounded-[1.25rem] border border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
              <DollarSign className="h-4.5 w-4.5 md:h-4 md:w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] md:text-sm font-medium text-foreground truncate">Prev. Earnings</p>
              <p className="text-[9px] md:text-xs text-muted-foreground truncate">{format(prevMonthDate, "MMM yyyy")}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm md:text-xl font-bold tracking-tight">₹{prevMonthEarnings.toLocaleString("en-IN")}</p>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-emerald-600/80 mt-0.5">Earned</p>
          </div>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, i) => (
          <Card
            key={stat.title}
            className="group border-border/40 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 hover:border-border/60 transition-all duration-300 overflow-hidden relative"
          >
            <CardContent className="p-3.5 md:p-5">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div
                  className={`h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                >
                  <stat.icon className={`h-4.5 w-4.5 md:h-5 md:w-5 ${stat.iconColor}`} />
                </div>
                {stat.trend && (
                  <span className="text-[9px] md:text-xs font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-lg md:text-2xl font-bold tracking-tight">
                {stat.value}
              </p>
              <p className="text-[11px] md:text-sm text-muted-foreground mt-0.5 truncate">
                {stat.title}
              </p>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </Card>
        ))}
      </div>

      {/* Monthly Performance Chart */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-sm group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <CardHeader className="p-4 md:p-6 pb-2 md:pb-6">
          <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 md:h-5 md:w-5 text-primary" />
            Performance Overview
          </CardTitle>
          <p className="text-[11px] md:text-sm text-muted-foreground mt-0.5 md:mt-1">
            Daily review counts and earnings for {format(today, "MMMM yyyy")}
          </p>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
          <ChartContainer config={chartConfig} className="h-[180px] md:h-[300px] w-full">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tickFormatter={(value) => value.slice(0, 3) + " " + value.slice(4)}
                style={{ fontSize: '11px', fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                style={{ fontSize: '11px', fill: "hsl(var(--muted-foreground))" }}
                width={40}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
                style={{ fontSize: '11px', fill: "hsl(var(--muted-foreground))" }}
                width={50}
              />
              <ChartTooltip
                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="earnings"
                stroke="#10b981"
                fill="url(#fillEarnings)"
                strokeWidth={2}
                activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
              />
              <Bar
                yAxisId="left"
                dataKey="reviews"
                fill="hsl(221, 83%, 53%)"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Content Grid — Bento Style */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Activity — Takes 2 columns */}
        <Card className="lg:col-span-2 border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Recent Activity
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your latest mentorship reviews
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-primary gap-1 rounded-lg"
                onClick={() => navigate("/reviews")}
              >
                View All
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-7 w-7 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              </div>
            ) : recentReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  No reviews yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Start by adding your first review
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-accent/40 transition-colors group/item cursor-default"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary/12 transition-colors">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate leading-tight">
                        {review.review_topic}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {review.mentor_name} → {review.intern_name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-sm">
                          {review.review_score}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {format(new Date(review.review_date), "MMM dd")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions — Side column */}
        <div className="space-y-4">
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Quick Actions
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Frequently used shortcuts
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => navigate("/reviews")}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group/action text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover/action:scale-105 transition-transform">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Add Review</p>
                  <p className="text-xs text-muted-foreground">
                    Log a new session
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 ml-auto group-hover/action:text-primary transition-colors" />
              </button>

              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group/action text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover/action:scale-105 transition-transform">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Rate</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{currentRate}/review
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 ml-auto group-hover/action:text-primary transition-colors" />
              </button>

              <button
                onClick={() => navigate("/schedules")}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group/action text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover/action:scale-105 transition-transform">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Schedules</p>
                  <p className="text-xs text-muted-foreground">
                    Coming soon
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 ml-auto group-hover/action:text-primary transition-colors" />
              </button>

              <PWAInstallButton variant="quick-action" />

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Complete Schedule Modal */}
      <Dialog open={!!completeScheduleData} onOpenChange={(open) => !open && setCompleteScheduleData(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] max-md:bottom-0 max-md:top-auto max-md:translate-y-0 max-md:rounded-t-[2rem] max-md:rounded-b-none max-md:w-full max-md:max-w-none max-md:slide-in-from-bottom-5 max-md:animate-in p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">Complete Schedule</DialogTitle>
            <DialogDescription>
              Mark {completeScheduleData?.intern_name}'s session as completed and save it as a review. Select a review score out of 10.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Review Score</span>
                <span className="text-primary text-xl font-bold">{reviewScore}/10</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <Button
                    key={score}
                    type="button"
                    variant={reviewScore >= score ? "default" : "outline"}
                    className={cn(
                      "h-10 w-full transition-all duration-200",
                      reviewScore >= score
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground hover:border-primary/50"
                    )}
                    onClick={() => setReviewScore(score)}
                  >
                    {score}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCompleteScheduleData(null)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCompleteSchedule}
                disabled={isSubmittingReview}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmittingReview ? "Saving..." : "Save as Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
