import { Schema, model, models, Document, Types } from "mongoose";

export interface ILecture extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  content: string;
  pdfUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const LectureSchema = new Schema<ILecture>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
      index: true, // For fast queries by course
    },
    title: {
      type: String,
      required: [true, "Lecture title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    content: {
      type: String,
      required: [true, "Lecture content is required"],
      minlength: [10, "Content must be at least 10 characters"],
    },
    pdfUrl: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      required: [true, "Lecture order is required"],
      min: [1, "Order must be at least 1"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient sorting
LectureSchema.index({ courseId: 1, order: 1 });

const Lecture = models.Lecture || model<ILecture>("Lecture", LectureSchema);

export default Lecture;
