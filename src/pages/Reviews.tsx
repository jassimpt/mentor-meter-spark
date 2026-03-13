import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  RotateCcw,
  FileText,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateReviewsPdf } from "@/utils/pdfGenerator";

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

const reviewSchema = z.object({
  mentor_name: z.string().min(1, "Mentor name is required"),
  intern_name: z.string().min(1, "Intern name is required"),
  review_date: z.string().min(1, "Review date is required"),
  review_topic: z.string().min(1, "Review topic is required"),
  review_score: z.coerce.number().min(1).max(10),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

type SortField = "review_date" | "review_score" | "intern_name" | "mentor_name";
type SortDirection = "asc" | "desc";

const Reviews = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search / Filter / Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("review_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { toast } = useToast();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      mentor_name: "",
      intern_name: "",
      review_date: format(new Date(), "yyyy-MM-dd"),
      review_topic: "",
      review_score: 5,
    },
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await api.get<ReviewData[]>("/api/reviews");
      setReviews(data);
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

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      if (editingReview) {
        await api.put(`/api/reviews/${editingReview.id}`, data);
        toast({
          title: "Review updated",
          description: "The review has been updated successfully.",
        });
      } else {
        await api.post("/api/reviews", data);
        toast({
          title: "Review added",
          description: "New review has been added successfully.",
        });
      }
      resetForm();
      fetchReviews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving review",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review: ReviewData) => {
    setEditingReview(review);
    form.reset({
      mentor_name: review.mentor_name,
      intern_name: review.intern_name,
      review_date: review.review_date,
      review_topic: review.review_topic,
      review_score: review.review_score,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/reviews/${id}`);
      toast({
        title: "Review deleted",
        description: "The review has been deleted.",
      });
      setDeletingReviewId(null);
      fetchReviews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting review",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setEditingReview(null);
    setIsModalOpen(false);
    form.reset({
      mentor_name: "",
      intern_name: "",
      review_date: format(new Date(), "yyyy-MM-dd"),
      review_topic: "",
      review_score: 5,
    });
  };

  // Available months from data
  const availableMonths = Array.from(
    new Set(reviews.map((r) => format(new Date(r.review_date), "yyyy-MM")))
  ).sort().reverse();

  // Filter + Search + Sort
  const filteredReviews = reviews
    .filter((review) => {
      if (filterMonth !== "all") {
        const reviewMonth = format(new Date(review.review_date), "yyyy-MM");
        if (reviewMonth !== filterMonth) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          review.mentor_name.toLowerCase().includes(q) ||
          review.intern_name.toLowerCase().includes(q) ||
          review.review_topic.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "review_date":
          cmp = a.review_date.localeCompare(b.review_date);
          break;
        case "review_score":
          cmp = a.review_score - b.review_score;
          break;
        case "intern_name":
          cmp = a.intern_name.localeCompare(b.intern_name);
          break;
        case "mentor_name":
          cmp = a.mentor_name.localeCompare(b.mentor_name);
          break;
      }
      return sortDirection === "desc" ? -cmp : cmp;
    });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterMonth("all");
    setSortField("review_date");
    setSortDirection("desc");
  };

  const handleDownloadPdf = () => {
    const paymentRate = parseFloat(localStorage.getItem("perReviewPayment") || "0");
    generateReviewsPdf(
      filteredReviews.map((r) => ({
        ...r,
        review_date: r.review_date,
      })),
      paymentRate,
      filterMonth !== "all" ? filterMonth : undefined
    );
    toast({ title: "PDF Downloaded", description: "Your report has been downloaded." });
  };

  const isFiltered = searchQuery || filterMonth !== "all";

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Reviews
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your mentorship review records
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            className="gap-1.5 rounded-xl text-xs border-border/60 hover:border-primary/30 hover:bg-primary/5"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>

          <Dialog
            open={isModalOpen}
            onOpenChange={(open) => {
              if (!open) resetForm();
              setIsModalOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-1.5 bg-gradient-primary hover:opacity-90 text-white shadow-md shadow-primary/15 rounded-xl text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Review</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingReview ? "Edit Review" : "New Review"}
                </DialogTitle>
                <DialogDescription>
                  {editingReview
                    ? "Update this review's details."
                    : "Fill in the details to log a new mentorship review."}
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 pt-2"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="mentor_name"
                      className="text-sm font-medium"
                    >
                      Mentor Name
                    </Label>
                    <Input
                      id="mentor_name"
                      placeholder="Jane Doe"
                      {...form.register("mentor_name")}
                      className="rounded-xl h-11 border-border/40 focus:border-primary focus:ring-primary/20"
                    />
                    {form.formState.errors.mentor_name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.mentor_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="intern_name"
                      className="text-sm font-medium"
                    >
                      Intern Name
                    </Label>
                    <Input
                      id="intern_name"
                      placeholder="John Smith"
                      {...form.register("intern_name")}
                      className="rounded-xl h-11 border-border/40 focus:border-primary focus:ring-primary/20"
                    />
                    {form.formState.errors.intern_name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.intern_name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="review_date"
                      className="text-sm font-medium"
                    >
                      Review Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 rounded-xl justify-start text-left font-normal border-border/40",
                            !form.watch("review_date") && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("review_date")
                            ? format(new Date(form.watch("review_date")), "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            form.watch("review_date")
                              ? new Date(form.watch("review_date"))
                              : undefined
                          }
                          onSelect={(date) =>
                            date &&
                            form.setValue(
                              "review_date",
                              format(date, "yyyy-MM-dd")
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.review_date && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.review_date.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="review_score"
                      className="text-sm font-medium"
                    >
                      Score (1-10)
                    </Label>
                    <Input
                      id="review_score"
                      type="number"
                      min="1"
                      max="10"
                      step="0.5"
                      {...form.register("review_score")}
                      className="rounded-xl h-11 border-border/40 focus:border-primary focus:ring-primary/20"
                    />
                    {form.formState.errors.review_score && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.review_score.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="review_topic"
                    className="text-sm font-medium"
                  >
                    Topic
                  </Label>
                  <Textarea
                    id="review_topic"
                    placeholder="What was covered in this review session?"
                    {...form.register("review_topic")}
                    className="rounded-xl resize-none border-border/40 focus:border-primary focus:ring-primary/20 min-h-[80px]"
                  />
                  {form.formState.errors.review_topic && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.review_topic.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 rounded-xl h-11 border-border/60 hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl h-11 bg-gradient-primary hover:opacity-90 text-white shadow-md shadow-primary/15"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Saving...
                      </div>
                    ) : editingReview ? (
                      "Update Review"
                    ) : (
                      "Save Review"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl border-border/40 bg-background/50 focus:bg-background focus:border-primary focus:ring-primary/20"
              />
            </div>

            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl border-border/40">
                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {format(new Date(month + "-01"), "MMMM yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredReviews.length}{" "}
          {filteredReviews.length === 1 ? "review" : "reviews"} found
        </p>
        {filteredReviews.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Avg. Score:{" "}
            <span className="font-semibold text-foreground">
              {(
                filteredReviews.reduce(
                  (sum, r) => sum + Number(r.review_score),
                  0
                ) / filteredReviews.length
              ).toFixed(1)}
            </span>
          </p>
        )}
      </div>

      {/* Table */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-base font-medium text-muted-foreground">
                {isFiltered ? "No matching reviews" : "No reviews yet"}
              </p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {isFiltered
                  ? "Try adjusting your filters"
                  : "Click 'Add Review' to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 bg-muted/30 hover:bg-muted/30">
                    <TableHead
                      className="cursor-pointer hover:text-foreground transition-colors py-3.5"
                      onClick={() => handleSort("review_date")}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground transition-colors py-3.5"
                      onClick={() => handleSort("mentor_name")}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        Mentor
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground transition-colors py-3.5"
                      onClick={() => handleSort("intern_name")}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        Intern
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="py-3.5">
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Topic
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground transition-colors py-3.5"
                      onClick={() => handleSort("review_score")}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        Score
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="text-right py-3.5">
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Actions
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow
                      key={review.id}
                      className="border-border/30 hover:bg-accent/30 transition-colors"
                    >
                      <TableCell className="font-medium py-4 text-sm">
                        {format(new Date(review.review_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="py-4 text-sm">
                        {review.mentor_name}
                      </TableCell>
                      <TableCell className="py-4 text-sm">
                        {review.intern_name}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate py-4 text-sm text-muted-foreground">
                        {review.review_topic}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-sm">
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

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingReviewId}
        onOpenChange={() => setDeletingReviewId(null)}
      >
        <AlertDialogContent className="sm:max-w-md rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              review from our servers.
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
