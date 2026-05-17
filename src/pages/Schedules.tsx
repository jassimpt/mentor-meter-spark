import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
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
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Link as LinkIcon,
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
import { format, parseISO, isPast, isToday } from "date-fns";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

const scheduleSchema = z.object({
  mentor_name: z.string().min(1, "Mentor name is required"),
  intern_name: z.string().min(1, "Intern name is required"),
  schedule_date: z.string().min(1, "Date is required"),
  schedule_time: z.string().min(1, "Time is required"),
  session_topic: z.string().min(1, "Topic is required"),
  meet_link: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;
type SortField = "schedule_date" | "intern_name" | "mentor_name" | "schedule_status";
type SortDirection = "asc" | "desc";

const Schedules = () => {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleData | null>(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [completeScheduleData, setCompleteScheduleData] = useState<ScheduleData | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Search / Filter / Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("schedule_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { toast } = useToast();

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      mentor_name: "",
      intern_name: "",
      schedule_date: format(new Date(), "yyyy-MM-dd"),
      schedule_time: "09:00",
      session_topic: "",
      meet_link: "",
    },
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await api.get<ScheduleData[]>("/api/schedules");
      setSchedules(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching schedules",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        meet_link: data.meet_link || null,
      };

      if (editingSchedule) {
        await api.put(`/api/schedules/${editingSchedule.id}`, payload);
        toast({
          title: "Schedule updated",
          description: "The schedule has been updated successfully.",
        });
      } else {
        await api.post("/api/schedules", payload);
        toast({
          title: "Schedule added",
          description: "New schedule has been added successfully.",
        });
      }
      resetForm();
      fetchSchedules();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving schedule",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (schedule: ScheduleData) => {
    setEditingSchedule(schedule);
    form.reset({
      mentor_name: schedule.mentor_name,
      intern_name: schedule.intern_name,
      schedule_date: schedule.schedule_date,
      schedule_time: schedule.schedule_time,
      session_topic: schedule.session_topic,
      meet_link: schedule.meet_link || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/schedules/${id}`);
      toast({
        title: "Schedule deleted",
        description: "The schedule has been deleted.",
      });
      setDeletingScheduleId(null);
      fetchSchedules();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting schedule",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error completing schedule",
        description: error.message,
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setIsModalOpen(false);
    form.reset({
      mentor_name: "",
      intern_name: "",
      schedule_date: format(new Date(), "yyyy-MM-dd"),
      schedule_time: "09:00",
      session_topic: "",
      meet_link: "",
    });
  };

  // Filter + Search + Sort
  const filteredSchedules = schedules
    .filter((schedule) => {
      if (filterStatus !== "all" && schedule.schedule_status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          schedule.mentor_name.toLowerCase().includes(q) ||
          schedule.intern_name.toLowerCase().includes(q) ||
          schedule.session_topic.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "schedule_date":
          cmp = a.schedule_date.localeCompare(b.schedule_date);
          break;
        case "intern_name":
          cmp = a.intern_name.localeCompare(b.intern_name);
          break;
        case "mentor_name":
          cmp = a.mentor_name.localeCompare(b.mentor_name);
          break;
        case "schedule_status":
          cmp = a.schedule_status.localeCompare(b.schedule_status);
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
    setFilterStatus("all");
    setSortField("schedule_date");
    setSortDirection("desc");
  };

  const isFiltered = searchQuery || filterStatus !== "all";

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Schedules
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your mentorship session schedules
          </p>
        </div>

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
              <span>Add Schedule</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-[2rem] max-md:bottom-0 max-md:top-auto max-md:translate-y-0 max-md:rounded-t-[2rem] max-md:rounded-b-none max-md:w-full max-md:max-w-none max-md:slide-in-from-bottom-5 max-md:animate-in p-6 max-md:max-h-[85vh] max-md:overflow-y-auto max-md:pb-12">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingSchedule ? "Edit Schedule" : "New Schedule"}
              </DialogTitle>
              <DialogDescription>
                {editingSchedule
                  ? "Update this schedule's details."
                  : "Schedule a new mentorship session."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 pt-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mentor_name" className="text-sm font-medium">
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
                  <Label htmlFor="intern_name" className="text-sm font-medium">
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
                  <Label htmlFor="schedule_date" className="text-sm font-medium">
                    Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-11 rounded-xl justify-start text-left font-normal border-border/40",
                          !form.watch("schedule_date") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("schedule_date")
                          ? format(new Date(form.watch("schedule_date")), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          form.watch("schedule_date")
                            ? new Date(form.watch("schedule_date"))
                            : undefined
                        }
                        onSelect={(date) =>
                          date &&
                          form.setValue("schedule_date", format(date, "yyyy-MM-dd"))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule_time" className="text-sm font-medium">
                    Time
                  </Label>
                  <Input
                    id="schedule_time"
                    type="time"
                    {...form.register("schedule_time")}
                    className="rounded-xl h-11 border-border/40 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_topic" className="text-sm font-medium">
                  Session Topic
                </Label>
                <Textarea
                  id="session_topic"
                  placeholder="What will be covered in this session?"
                  {...form.register("session_topic")}
                  className="rounded-xl resize-none border-border/40 focus:border-primary focus:ring-primary/20 min-h-[80px]"
                />
                {form.formState.errors.session_topic && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.session_topic.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meet_link" className="text-sm font-medium">
                  Meet Link (optional)
                </Label>
                <Input
                  id="meet_link"
                  placeholder="https://meet.google.com/..."
                  {...form.register("meet_link")}
                  className="rounded-xl h-11 border-border/40 focus:border-primary focus:ring-primary/20"
                />
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
                  ) : editingSchedule ? (
                    "Update Schedule"
                  ) : (
                    "Save Schedule"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl border-border/40">
                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
          {filteredSchedules.length}{" "}
          {filteredSchedules.length === 1 ? "schedule" : "schedules"} found
        </p>
      </div>

      {/* Table */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-base font-medium text-muted-foreground">
                {isFiltered ? "No matching schedules" : "No schedules yet"}
              </p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {isFiltered
                  ? "Try adjusting your filters"
                  : "Click 'Add Schedule' to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 bg-muted/30 hover:bg-muted/30">
                      <TableHead
                        className="cursor-pointer hover:text-foreground transition-colors py-3.5"
                        onClick={() => handleSort("schedule_date")}
                      >
                        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                          Date & Time
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
                      <TableHead className="py-3.5">
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Meet
                        </span>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:text-foreground transition-colors py-3.5"
                        onClick={() => handleSort("schedule_status")}
                      >
                        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                          Status
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
                    {filteredSchedules.map((schedule) => {
                      const scheduleDateTime = new Date(`${schedule.schedule_date}T${schedule.schedule_time}`);
                      const canComplete = schedule.schedule_status === "pending" && isPast(scheduleDateTime);

                      return (
                        <TableRow
                          key={schedule.id}
                          className="border-border/30 hover:bg-accent/30 transition-colors"
                        >
                          <TableCell className="py-4">
                            <div>
                              <p className="font-medium text-sm">
                                {format(new Date(schedule.schedule_date), "MMM dd, yyyy")}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {format(parseISO(`1970-01-01T${schedule.schedule_time}`), "hh:mm a")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-sm">
                            {schedule.mentor_name}
                          </TableCell>
                          <TableCell className="py-4 text-sm">
                            {schedule.intern_name}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate py-4 text-sm text-muted-foreground">
                            {schedule.session_topic}
                          </TableCell>
                          <TableCell className="py-4">
                            {schedule.meet_link ? (
                              <a
                                href={schedule.meet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <LinkIcon className="h-3 w-3" />
                                Join
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className={cn(
                              "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold",
                              schedule.schedule_status === "completed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : schedule.schedule_status === "cancelled"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            )}>
                              {schedule.schedule_status === "completed"
                                ? "Completed"
                                : schedule.schedule_status === "cancelled"
                                ? "Cancelled"
                                : "Pending"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <div className="flex justify-end gap-2">
                              {canComplete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Mark as completed"
                                  onClick={() => setCompleteScheduleData(schedule)}
                                  className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(schedule)}
                                className="h-8 px-3 text-xs bg-transparent border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all"
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                <span>Edit</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingScheduleId(schedule.id)}
                                className="h-8 px-3 text-xs bg-transparent border-border hover:border-destructive/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                <span>Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col gap-3 p-3 bg-muted/10">
                {filteredSchedules.map((schedule) => {
                  const scheduleDateTime = new Date(`${schedule.schedule_date}T${schedule.schedule_time}`);
                  const canComplete = schedule.schedule_status === "pending" && isPast(scheduleDateTime);

                  return (
                    <div key={schedule.id} className="bg-card rounded-xl p-4 shadow-sm border border-border/40 relative">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{schedule.session_topic}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {format(new Date(schedule.schedule_date), "MMM dd")} • {format(parseISO(`1970-01-01T${schedule.schedule_time}`), "hh:mm a")}
                          </p>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          schedule.schedule_status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : schedule.schedule_status === "cancelled"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}>
                          {schedule.schedule_status === "completed"
                            ? "Completed"
                            : schedule.schedule_status === "cancelled"
                            ? "Cancelled"
                            : "Pending"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 mt-3">
                        <div className="flex-1 bg-muted/50 rounded-lg p-2 text-center">
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Mentor</p>
                          <p className="text-xs font-medium text-foreground truncate">{schedule.mentor_name}</p>
                        </div>
                        <div className="flex-1 bg-muted/50 rounded-lg p-2 text-center">
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Intern</p>
                          <p className="text-xs font-medium text-foreground truncate">{schedule.intern_name}</p>
                        </div>
                      </div>

                      {schedule.meet_link && (
                        <div className="mb-4">
                          <a
                            href={schedule.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 w-full h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-colors"
                          >
                            <LinkIcon className="h-3.5 w-3.5" />
                            Join Meeting
                          </a>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {canComplete && (
                          <Button
                            size="sm"
                            title="Mark as completed"
                            onClick={() => setCompleteScheduleData(schedule)}
                            className="flex-1 h-9 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm"
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            Complete
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
                          className={cn(
                            "h-9 text-xs bg-transparent border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all rounded-lg",
                            canComplete ? "px-3 w-auto flex-none" : "flex-1"
                          )}
                        >
                          <Pencil className={cn("h-3.5 w-3.5", canComplete ? "" : "mr-1.5")} />
                          {!canComplete && "Edit"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingScheduleId(schedule.id)}
                          className={cn(
                            "h-9 text-xs bg-transparent border-border hover:border-destructive/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all rounded-lg",
                            canComplete ? "px-3 w-auto flex-none" : "flex-1"
                          )}
                        >
                          <Trash2 className={cn("h-3.5 w-3.5", canComplete ? "" : "mr-1.5")} />
                          {!canComplete && "Delete"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingScheduleId} onOpenChange={() => setDeletingScheduleId(null)}>
        <AlertDialogContent className="sm:max-w-md rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the schedule from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-2">
            <AlertDialogCancel className="rounded-xl h-11 border-border/60 hover:bg-muted/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (deletingScheduleId) handleDelete(deletingScheduleId);
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
                "Delete Schedule"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

export default Schedules;
