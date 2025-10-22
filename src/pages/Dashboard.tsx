import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Calendar, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

const Dashboard = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentRate, setPaymentRate] = useState("");
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load payment rate from localStorage
    const savedRate = localStorage.getItem("perReviewPayment");
    if (savedRate) {
      setCurrentRate(parseFloat(savedRate));
    }

    // Fetch reviews
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
    setPaymentRate(prev => prev + num);
  };

  const handleClear = () => {
    setPaymentRate("");
  };

  const handleDelete = () => {
    setPaymentRate(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    const rate = parseFloat(paymentRate);
    if (!isNaN(rate) && rate > 0) {
      localStorage.setItem("perReviewPayment", rate.toString());
      setCurrentRate(rate);
      setIsPaymentModalOpen(false);
      setPaymentRate("");
    }
  };

  // Calculate stats
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  const reviewsThisMonth = reviews.filter(r => {
    const reviewDate = new Date(r.review_date);
    return reviewDate >= monthStart && reviewDate <= monthEnd;
  });

  const reviewsToday = reviews.filter(r => {
    const reviewDate = new Date(r.review_date);
    return reviewDate >= dayStart && reviewDate <= dayEnd;
  });

  const stats = [
    {
      title: "Total Reviews This Month",
      value: reviewsThisMonth.length.toString(),
      change: `${reviewsThisMonth.length} reviews`,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Total Payment This Month",
      value: `$${(reviewsThisMonth.length * currentRate).toFixed(2)}`,
      change: `Rate: $${currentRate}/review`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Reviews Today",
      value: reviewsToday.length.toString(),
      change: format(today, "MMM dd, yyyy"),
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Total Payment Today",
      value: `$${(reviewsToday.length * currentRate).toFixed(2)}`,
      change: `${reviewsToday.length} reviews`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  const recentReviews = reviews.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogTrigger asChild>
            <Button>Configure Your Payment Rate</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set Payment Rate</DialogTitle>
              <DialogDescription>
                Enter your payment rate per review
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold h-16 flex items-center justify-center border rounded-lg bg-muted">
                  ${paymentRate || "0"}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    size="lg"
                    onClick={() => handleNumberClick(num.toString())}
                    className="text-xl h-14"
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClear}
                  className="text-xl h-14"
                >
                  C
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleNumberClick("0")}
                  className="text-xl h-14"
                >
                  0
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDelete}
                  className="text-xl h-14"
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleNumberClick(".")}
                  className="text-xl h-14"
                >
                  .
                </Button>
              </div>
              <Button onClick={handleSubmit} className="w-full" size="lg">
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentReviews.length === 0 ? (
            <p className="text-muted-foreground text-center p-8">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{review.review_topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {review.mentor_name} → {review.intern_name} • {format(new Date(review.review_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{review.review_score}</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
