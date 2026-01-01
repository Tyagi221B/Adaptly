"use server";

import { ZodError } from "zod";
import { updateTag, revalidatePath, cacheLife, cacheTag } from "next/cache";
import dbConnect from "@/lib/mongodb";
import CourseReview from "@/database/course-review.model";
import Course from "@/database/course.model";
import Enrollment from "@/database/enrollment.model";
import { Types } from "mongoose";

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CreateReviewInput {
  courseId: string;
  rating: number;
  comment?: string;
}

// Create or update a review (upsert)
export async function createOrUpdateReview(
  studentId: string,
  input: CreateReviewInput
): Promise<ActionResponse<{ reviewId: string }>> {
  try {
    await dbConnect();

    const { courseId, rating, comment } = input;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
    });

    if (!enrollment) {
      return {
        success: false,
        error: "You must be enrolled in this course to review it",
      };
    }

    // Upsert review (create or update)
    const review = await CourseReview.findOneAndUpdate(
      {
        studentId: new Types.ObjectId(studentId),
        courseId: new Types.ObjectId(courseId),
      },
      {
        rating,
        comment: comment || null,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    await updateCourseRating(courseId);

    updateTag('courses');
    updateTag('reviews');
    revalidatePath(`/courses/${courseId}`);
    revalidatePath('/student/dashboard');
    revalidatePath('/student/discover');

    return {
      success: true,
      data: { reviewId: review._id.toString() },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit review",
    };
  }
}

// Get all reviews for a course
export async function getCourseReviews(
  courseId: string
): Promise<
  ActionResponse<
    Array<{
      _id: string;
      studentName: string;
      rating: number;
      comment?: string;
      createdAt: Date;
      updatedAt: Date;
    }>
  >
> {
  'use cache'
  cacheLife('minutes')
  cacheTag('reviews')
  cacheTag('courses')

  try {
    await dbConnect();

    const reviews = await CourseReview.find({
      courseId: new Types.ObjectId(courseId),
    })
      .populate("studentId", "name")
      .sort({ createdAt: -1 })
      .lean();

    type PopulatedReview = {
      _id: Types.ObjectId;
      studentId: { _id: Types.ObjectId; name: string };
      rating: number;
      comment?: string;
      createdAt: Date;
      updatedAt: Date;
    };

    const formattedReviews = (reviews as PopulatedReview[]).map((review) => ({
      _id: review._id.toString(),
      studentName: review.studentId?.name || "Anonymous",
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    return {
      success: true,
      data: formattedReviews,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch reviews",
    };
  }
}

// Get student's review for a course
export async function getMyReview(
  studentId: string,
  courseId: string
): Promise<
  ActionResponse<{
    _id: string;
    rating: number;
    comment?: string;
    createdAt: Date;
  } | null>
> {
  'use cache'
  cacheLife('seconds')
  cacheTag('reviews')

  try {
    await dbConnect();

    const review = await CourseReview.findOne({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
    }).lean();

    if (!review) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        _id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch review",
    };
  }
}

// Delete a review
export async function deleteReview(
  studentId: string,
  reviewId: string
): Promise<ActionResponse> {
  try {
    await dbConnect();

    const review = await CourseReview.findOneAndDelete({
      _id: new Types.ObjectId(reviewId),
      studentId: new Types.ObjectId(studentId),
    });

    if (!review) {
      return {
        success: false,
        error: "Review not found or you don't have permission",
      };
    }

    // Recalculate course rating
    await updateCourseRating(review.courseId.toString());

    updateTag('courses');
    updateTag('reviews');
    revalidatePath(`/courses/${review.courseId.toString()}`);
    revalidatePath('/student/dashboard');
    revalidatePath('/student/discover');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete review",
    };
  }
}

// Helper: Update course average rating and total reviews
async function updateCourseRating(courseId: string) {
  try {
    const reviews = await CourseReview.find({
      courseId: new Types.ObjectId(courseId),
    }).lean();

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
    });
  } catch (error) {
    console.error("Failed to update course rating:", error);
  }
}

// Get course rating stats
export async function getCourseRatingStats(
  courseId: string
): Promise<
  ActionResponse<{
    averageRating: number;
    totalReviews: number;
    distribution: { [key: number]: number }; // 1-5 stars count
  }>
> {
  'use cache'
  cacheLife('minutes')
  cacheTag('reviews')
  cacheTag('courses')

  try {
    await dbConnect();

    const reviews = await CourseReview.find({
      courseId: new Types.ObjectId(courseId),
    }).lean();

    const distribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      distribution[review.rating]++;
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    return {
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        distribution,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch rating stats",
    };
  }
}
