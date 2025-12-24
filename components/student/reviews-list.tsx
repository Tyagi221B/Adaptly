import { StarRating } from "@/components/ui/star-rating";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCourseReviews } from "@/actions/course-review.actions";
import { formatDistanceToNow } from "date-fns";

interface ReviewsListProps {
  courseId: string;
}

export async function ReviewsList({ courseId }: ReviewsListProps) {
  const result = await getCourseReviews(courseId);
  const reviews = result.success ? result.data || [] : [];

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No reviews yet. Be the first to review this course!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Reviews</CardTitle>
        <CardDescription>{reviews.length} reviews</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review, index) => (
          <div key={review._id}>
            {index > 0 && <Separator className="mb-6" />}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{review.studentName}</p>
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
