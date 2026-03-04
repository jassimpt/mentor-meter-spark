import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Star,
  CalendarIcon,
  Pencil,
  ClipboardList,
  Filter,
  Trash2,
  FileText,
  X,
} from "lucide-react";
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
  review_score: z
    .number()
    .min(1, "Score must be at least 1")
    .max(10, "Score must be at most 10"),
});

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("review")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Review deleted",
        description: "The review has been successfully removed.",
      });

      fetchReviews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting review",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
      setDeletingReviewId(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to add a review",
        });
        return;
      }

      if (editingReview) {
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
      setSubmitting(false);
      fetchReviews();
    } catch (error: any) {
      setSubmitting(false);
      toast({
        variant: "destructive",
        title: editingReview
          ? "Error updating review"
          : "Error adding review",
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
    const matchesSearch =
      review.intern_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      review.mentor_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      review.review_topic
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const reviewDate = new Date(review.review_date);
    const matchesStartDate = !startDate || reviewDate >= startDate;
    const matchesEndDate = !endDate || reviewDate <= endDate;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const handleGenerateReport = () => {
    const paymentRateString = localStorage.getItem("perReviewPayment");
    const paymentRate = paymentRateString
      ? parseFloat(paymentRateString)
      : 0;
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
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Reviews
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all mentorship reviews
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-md shadow-primary/20 gap-2">
              <Plus className="h-4 w-4" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingReview ? "Edit Review" : "Add New Review"}
              </DialogTitle>
              <DialogDescription>
                {editingReview
                  ? "Update the review details"
                  : "Fill in the details to add a new mentorship review"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 pt-2"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mentor_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Mentor Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter mentor name"
                            className="h-11 rounded-xl"
                            {...field}
                          />
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
                        <FormLabel className="text-sm font-medium">
                          Intern Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter intern name"
                            className="h-11 rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="review_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-medium">
                          Review Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal h-11 rounded-xl",
                                  !field.value &&
                                  "text-muted-foreground"
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
                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                          >
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
                    name="review_score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Score (1-10)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            step="0.5"
                            placeholder="Score (e.g. 7.5)"
                            className="h-11 rounded-xl"
                            {...field}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              field.onChange(isNaN(val) ? "" : val);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="review_topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Review Topic
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter review topic"
                          className="h-11 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white rounded-xl text-base font-semibold shadow-md shadow-primary/20 mt-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      {editingReview ? "Updating..." : "Saving..."}
                    </div>
                  ) : (
                    editingReview ? "Update Review" : "Save Review"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Card */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold">
                All Reviews
              </CardTitle>
              <CardDescription className="mt-0.5">
                {filteredReviews.length} review
                {filteredReviews.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "gap-2 rounded-lg h-9",
                  showFilters && "bg-primary/5 border-primary/30"
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                {(startDate || endDate) && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
              <Button
                onClick={handleGenerateReport}
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg h-9"
              >
                <FileText className="h-3.5 w-3.5" />
                Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by intern, mentor, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Date Filters */}
          {showFilters && (
            <div className="flex flex-wrap items-end gap-3 mb-4 p-4 rounded-xl bg-muted/30 border border-border/50 animate-fade-in">
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 rounded-lg",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "PPP")
                        : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 rounded-lg",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate
                        ? format(endDate, "PPP")
                        : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                  >
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
                  size="sm"
                  onClick={clearDateFilters}
                  className="text-muted-foreground hover:text-destructive h-10 gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-medium">
                No reviews found
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Add your first review to get started"}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-1/4">
                      Intern & Topic
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-1/4">
                      Mentor
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-1/6">
                      Score
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right w-1/6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow
                      key={review.id}
                      className="group border-b border-border/40 hover:bg-muted/20 transition-all duration-300"
                    >
                      <TableCell className="text-sm font-medium text-muted-foreground py-4">
                        {format(new Date(review.review_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm text-foreground">
                            {review.intern_name}
                          </p>
                          <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {review.review_topic}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {review.mentor_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {review.mentor_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span className="font-bold text-sm text-amber-700 dark:text-amber-500">
                            {review.review_score}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(review)}
                            className="h-8 md:px-3 text-xs bg-transparent border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all"
                          >
                            <Pencil className="h-3.5 w-3.5 md:mr-1.5" />
                            <span className="hidden md:inline">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingReviewId(review.id)}
                            className="h-8 md:px-3 text-xs bg-transparent border-border hover:border-destructive/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5 md:mr-1.5" />
                            <span className="hidden md:inline">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingReviewId} onOpenChange={() => setDeletingReviewId(null)}>
        <AlertDialogContent className="sm:max-w-md rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the review from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-2">
            <AlertDialogCancel className="rounded-xl h-11 border-border/60 hover:bg-muted/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (deletingReviewId) handleDelete(deletingReviewId);
              }}
              className="rounded-xl h-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-md shadow-destructive/20"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete Review"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reviews;
