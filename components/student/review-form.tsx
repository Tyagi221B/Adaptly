"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { StarRating } from "@/components/ui/star-rating";
import {
  createOrUpdateReview,
  deleteReview,
  getMyReview,
} from "@/actions/course-review.actions";

interface ReviewFormProps {
  courseId: string;
  studentId: string;
  courseName: string;
}

export function ReviewForm({
  courseId,
  studentId,
  courseName,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch existing review on mount
  useEffect(() => {
    async function fetchReview() {
      try {
        const result = await getMyReview(studentId, courseId);
        if (result.success && result.data) {
          setRating(result.data.rating);
          setComment(result.data.comment || "");
          setExistingReviewId(result.data._id);
        }
      } catch (err) {
        console.error("Failed to fetch review:", err);
      } finally {
        setIsFetching(false);
      }
    }

    fetchReview();
  }, [courseId, studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createOrUpdateReview(studentId, {
        courseId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (result.success) {
        toast.success(
          existingReviewId ? "Review updated!" : "Review submitted!"
        );
        setExistingReviewId(result.data!.reviewId);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to submit review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!existingReviewId) return;

    setShowDeleteDialog(false);
    setIsDeleting(true);

    try {
      const result = await deleteReview(studentId, existingReviewId);

      if (result.success) {
        toast.success("Review deleted");
        setRating(0);
        setComment("");
        setExistingReviewId(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isFetching) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReviewId ? "Edit Your Review" : "Write a Review"}
        </CardTitle>
        <CardDescription>
          Share your experience with {courseName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating *</Label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="What did you think about this course?"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/1000 characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || rating === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {existingReviewId ? "Updating..." : "Submitting..."}
                </>
              ) : existingReviewId ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </Button>

            {existingReviewId && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Your Review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your review. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
