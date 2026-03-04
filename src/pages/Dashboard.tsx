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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  subMonths,
} from "date-fns";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentRate, setPaymentRate] = useState("");
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedRate = localStorage.getItem("perReviewPayment");
    if (savedRate) {
      setCurrentRate(parseFloat(savedRate));
    }
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("review")
        .select("*")
        .eq("user_id", user.id)
        .order("review_date", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
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

  return (
    <div className="space-y-8 max-w-7xl">
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
          <DialogContent className="sm:max-w-md">
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

      {/* Previous Month Performance */}
      <div className="grid sm:grid-cols-2 gap-4 mb-2">
        <div className="flex items-center justify-between p-4 rounded-[1.25rem] border border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <History className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Previous Month</p>
              <p className="text-xs text-muted-foreground">{format(prevMonthDate, "MMMM yyyy")}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold tracking-tight">{reviewsPrevMonth.length}</p>
            <p className="text-xs font-medium text-muted-foreground">Reviews</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-[1.25rem] border border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Previous Earnings</p>
              <p className="text-xs text-muted-foreground">{format(prevMonthDate, "MMMM yyyy")}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold tracking-tight">₹{prevMonthEarnings.toLocaleString("en-IN")}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600/80 mt-0.5">Earned</p>
          </div>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card
            key={stat.title}
            className="group border-border/40 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 hover:border-border/60 transition-all duration-300 overflow-hidden relative"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                {stat.trend && (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {stat.title}
              </p>
            </CardContent>
            {/* Subtle gradient accent on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </Card>
        ))}
      </div>

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

        {/* Quick Actions — Side card */}
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

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
