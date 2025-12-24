import { Schema, model, models, Document, Types } from "mongoose";

export interface ICourse extends Document {
  _id: Types.ObjectId;
  instructorId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  thumbnailPublicId?: string;
  isPublished: boolean;
  enrolledStudentsCount: number;
  instructorMessage?: string;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor ID is required"],
      index: true, // For fast queries by instructor
    },
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "programming",
          "design",
          "business",
          "marketing",
          "data-science",
          "other",
        ],
        message: "Invalid category",
      },
    },
    thumbnail: {
      type: String,
      default: null,
    },
    thumbnailPublicId: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    enrolledStudentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    instructorMessage: {
      type: String,
      trim: true,
      maxlength: [2000, "Instructor message cannot exceed 2000 characters"],
      default: null,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching courses
CourseSchema.index({ title: "text", description: "text" });

const Course = models.Course || model<ICourse>("Course", CourseSchema);

export default Course;
