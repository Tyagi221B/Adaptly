import { Schema, model, models, Document, Types } from "mongoose";

export interface ICourseReview extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseReviewSchema = new Schema<ICourseReview>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only review a course once
CourseReviewSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Index for filtering by rating
CourseReviewSchema.index({ rating: 1 });

// Index for finding all reviews for a course
CourseReviewSchema.index({ courseId: 1, createdAt: -1 });

const CourseReview = models.CourseReview || model<ICourseReview>("CourseReview", CourseReviewSchema);

export default CourseReview;
