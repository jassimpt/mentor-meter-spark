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
  CalendarIcon,
  Pencil,
  Filter,
  Trash2,
  X,
  Link as LinkIcon,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isPast, isToday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

type Schedule = Tables<"schedule">;

const formSchema = z.object({
  mentor_name: z.string().min(1, "Mentor name is required"),
  intern_name: z.string().min(1, "Intern name is required"),
  schedule_date: z.date({ required_error: "Schedule date is required" }),
  schedule_time: z.string().min(1, "Schedule time is required"),
  session_topic: z.string().min(1, "Session topic is required"),
  meet_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const Schedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
  const [completeScheduleData, setCompleteScheduleData] = useState<Schedule | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mentor_name: "",
      intern_name: "",
      session_topic: "",
      schedule_time: "10:00",
      meet_link: "",
    },
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("schedule")
        .select("*")
        .order("schedule_date", { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
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

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("schedule")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Schedule deleted",
        description: "The schedule has been successfully removed.",
      });

      fetchSchedules();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting schedule",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
      setDeletingScheduleId(null);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("schedule")
        .update({ schedule_status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Schedule marked as ${newStatus}.`,
      });
      fetchSchedules();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message,
      });
    }
  };

  const handleCompleteSchedule = async () => {
    if (!completeScheduleData) return;
    setIsSubmittingReview(true);

    try {
      const { error: scheduleError } = await supabase
        .from("schedule")
        .update({ schedule_status: "completed" })
        .eq("id", completeScheduleData.id);

      if (scheduleError) throw scheduleError;

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error: reviewError } = await supabase
          .from("review")
          .insert({
            user_id: user.id,
            mentor_name: completeScheduleData.mentor_name,
            intern_name: completeScheduleData.intern_name,
            review_topic: completeScheduleData.session_topic,
            review_date: new Date().toISOString().split('T')[0],
            review_score: reviewScore
          });

        if (reviewError) throw reviewError;
      }

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
          description: "Please log in to add a schedule",
        });
        return;
      }

      if (editingSchedule) {
        const { error } = await supabase
          .from("schedule")
          .update({
            mentor_name: values.mentor_name,
            intern_name: values.intern_name,
            schedule_date: format(values.schedule_date, "yyyy-MM-dd"),
            schedule_time: values.schedule_time,
            session_topic: values.session_topic,
            meet_link: values.meet_link || null,
          })
          .eq("id", editingSchedule.id);

        if (error) throw error;

        toast({
          title: "Schedule updated successfully",
          description: "The schedule has been updated in the database",
        });
      } else {
        const { error } = await supabase.from("schedule").insert({
          mentor_name: values.mentor_name,
          intern_name: values.intern_name,
          schedule_date: format(values.schedule_date, "yyyy-MM-dd"),
          schedule_time: values.schedule_time,
          session_topic: values.session_topic,
          meet_link: values.meet_link || null,
          schedule_status: "pending",
          user_id: user.id,
        });

        if (error) throw error;

        toast({
          title: "Schedule added successfully",
          description: "The schedule has been saved to the database",
        });
      }

      form.reset();
      setEditingSchedule(null);
      setIsDialogOpen(false);
      setSubmitting(false);
      fetchSchedules();
    } catch (error: any) {
      setSubmitting(false);
      toast({
        variant: "destructive",
        title: editingSchedule
          ? "Error updating schedule"
          : "Error adding schedule",
        description: error.message,
      });
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    form.reset({
      mentor_name: schedule.mentor_name,
      intern_name: schedule.intern_name,
      schedule_date: parseISO(schedule.schedule_date),
      schedule_time: schedule.schedule_time,
      session_topic: schedule.session_topic,
      meet_link: schedule.meet_link || "",
    });
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingSchedule(null);
      form.reset();
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.intern_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      schedule.mentor_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      schedule.session_topic
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const scheduleDate = parseISO(schedule.schedule_date);
    const matchesStartDate = !startDate || scheduleDate >= startDate;
    const matchesEndDate = !endDate || scheduleDate <= endDate;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const isSchedulePast = (date: string, time: string) => {
    const scheduleDateTime = new Date(`${date}T${time}`);
    return isPast(scheduleDateTime);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Schedules
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your past and upcoming sessions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-md shadow-primary/20 gap-2">
              <Plus className="h-4 w-4" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
              </DialogTitle>
              <DialogDescription>
                {editingSchedule
                  ? "Update the schedule details"
                  : "Fill in the details to add a new session schedule"}
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
                    name="schedule_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-medium">
                          Schedule Date
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
                    name="schedule_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Time
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="h-11 rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="session_topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Session Topic
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter session topic"
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
                  name="meet_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Meet Link (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://meet.google.com/..."
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
                      {editingSchedule ? "Updating..." : "Saving..."}
                    </div>
                  ) : (
                    editingSchedule ? "Update Schedule" : "Save Schedule"
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
                All Schedules
              </CardTitle>
              <CardDescription className="mt-0.5">
                {filteredSchedules.length} schedule
                {filteredSchedules.length !== 1 ? "s" : ""} found
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
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-medium">
                No schedules found
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Add your first schedule to get started"}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                      Date & Time
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-1/4">
                      Intern & Topic
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-1/5">
                      Meet Link
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-1/6">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right w-1/5">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.map((schedule) => {
                    const isPastSchedule = isSchedulePast(schedule.schedule_date, schedule.schedule_time);
                    const canComplete = isPastSchedule && schedule.schedule_status === "pending";

                    return (
                      <TableRow
                        key={schedule.id}
                        className="group border-b border-border/40 hover:bg-muted/20 transition-all duration-300"
                      >
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {format(parseISO(schedule.schedule_date), "MMM dd, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {schedule.schedule_time}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-sm text-foreground">
                              {schedule.intern_name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="font-medium">Mentor:</span> {schedule.mentor_name}
                            </p>
                            <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                              {schedule.session_topic}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {schedule.meet_link ? (
                            <a
                              href={schedule.meet_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                              <LinkIcon className="h-3.5 w-3.5" />
                              <span className="underline underline-offset-2">Join Meet</span>
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">No link provided</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                            schedule.schedule_status === 'completed'
                              ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-500 border border-amber-500/20"
                          )}>
                            {schedule.schedule_status === 'completed' ? 'Completed' : 'Pending'}
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
                              className="h-8 md:px-3 text-xs bg-transparent border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all"
                            >
                              <Pencil className="h-3.5 w-3.5 md:mr-1.5" />
                              <span className="hidden md:inline">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingScheduleId(schedule.id)}
                              className="h-8 md:px-3 text-xs bg-transparent border-border hover:border-destructive/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5 md:mr-1.5" />
                              <span className="hidden md:inline">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
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
        <DialogContent className="sm:max-w-md">
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
