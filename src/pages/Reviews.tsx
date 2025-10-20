import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Star } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Review = Tables<"review">;

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

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

  const filteredReviews = reviews.filter(
    (review) =>
      review.intern_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.mentor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.review_topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage and track all mentorship reviews</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Review
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>
            A comprehensive list of all mentorship reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by intern, mentor, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
