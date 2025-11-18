import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Star, CalendarIcon, Pencil, FileText, X } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { generateReviewReport } from "@/utils/pdfGenerator";

type Review = Tables<"review">;

const formSchema = z.object({
  mentor_name: z.string().min(1, "Mentor name is required"),
  intern_name: z.string().min(1, "Intern name is required"),
  review_date: z.date({ required_error: "Review date is required" }),
  review_topic: z.string().min(1, "Review topic is required"),
  review_score: z.number().min(1, "Score must be at least 1").max(10, "Score must be at most 10"),
});

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mentor_name: "",
      intern_name: "",
      review_topic: "",
      review_score: 5,
    },
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("review")
        .select("*")
        .order("review_date", { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching reviews",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to add a review",
        });
        return;
      }

      if (editingReview) {
        // Update existing review
        const { error } = await supabase
          .from("review")
          .update({
            mentor_name: values.mentor_name,
            intern_name: values.intern_name,
            review_date: format(values.review_date, "yyyy-MM-dd"),
            review_topic: values.review_topic,
            review_score: values.review_score,
          })
          .eq("id", editingReview.id);

        if (error) throw error;

        toast({
          title: "Review updated successfully",
          description: "The review has been updated in the database",
        });
      } else {
        // Insert new review
        const { error } = await supabase.from("review").insert({
          mentor_name: values.mentor_name,
          intern_name: values.intern_name,
          review_date: format(values.review_date, "yyyy-MM-dd"),
          review_topic: values.review_topic,
          review_score: values.review_score,
          user_id: user.id,
        });

        if (error) throw error;

        toast({
          title: "Review added successfully",
          description: "The review has been saved to the database",
        });
      }

      form.reset();
      setEditingReview(null);
      setIsDialogOpen(false);
      fetchReviews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: editingReview ? "Error updating review" : "Error adding review",
        description: error.message,
      });
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    form.reset({
      mentor_name: review.mentor_name,
      intern_name: review.intern_name,
      review_date: new Date(review.review_date),
      review_topic: review.review_topic,
      review_score: review.review_score,
    });
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingReview(null);
      form.reset();
    }
  };

  const filteredReviews = reviews.filter((review) => {
    // Search filter
    const matchesSearch =
      review.intern_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.mentor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.review_topic.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter
    const reviewDate = new Date(review.review_date);
    const matchesStartDate = !startDate || reviewDate >= startDate;
    const matchesEndDate = !endDate || reviewDate <= endDate;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const handleGenerateReport = () => {
    const paymentRateString = localStorage.getItem("perReviewPayment");
    const paymentRate = paymentRateString ? parseFloat(paymentRateString) : 0;
    generateReviewReport(filteredReviews, paymentRate, startDate, endDate);
    toast({
      title: "Report generated",
      description: "Your PDF report has been downloaded successfully",
    });
  };

  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage and track all mentorship reviews</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingReview ? "Edit Review" : "Add New Review"}</DialogTitle>
              <DialogDescription>
                {editingReview ? "Update the review details" : "Fill in the details to add a new mentorship review"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="mentor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mentor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mentor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intern_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intern Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter intern name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="review_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Review Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="review_topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter review topic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="review_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Score (1-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="Enter score"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {editingReview ? "Update Review" : "Save Review"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>
            A comprehensive list of all mentorship reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by intern, mentor, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearDateFilters}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <Button
                onClick={handleGenerateReport}
                className="flex-shrink-0 gap-2"
                variant="secondary"
              >
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Intern</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          {new Date(review.review_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {review.intern_name}
                        </TableCell>
                        <TableCell>{review.mentor_name}</TableCell>
                        <TableCell>{review.review_topic}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">{review.review_score}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(review)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reviews;
