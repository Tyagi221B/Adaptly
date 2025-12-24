import { Schema, model, models, Document, Types } from "mongoose";

export interface IRemedialContent extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  quizAttemptId: Types.ObjectId;
  courseId: Types.ObjectId;
  lectureId: Types.ObjectId;
  content: string; // AI-generated markdown
  wrongQuestions: number[]; // Question indices that were wrong
  generatedAt: Date;
  wasHelpful?: boolean; // Optional feedback from student
  createdAt: Date;
  updatedAt: Date;
}

const RemedialContentSchema = new Schema<IRemedialContent>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizAttemptId: {
      type: Schema.Types.ObjectId,
      ref: "QuizAttempt",
      required: true,
      unique: true, // One remedial content per attempt
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    lectureId: {
      type: Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    wrongQuestions: [
      {
        type: Number,
        required: true,
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    wasHelpful: {
      type: Boolean,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding student's remedial content per lecture
RemedialContentSchema.index({ studentId: 1, lectureId: 1 });

// Index for tracking all remedial content for a course
RemedialContentSchema.index({ courseId: 1, generatedAt: -1 });

const RemedialContent = models.RemedialContent || model<IRemedialContent>("RemedialContent", RemedialContentSchema);

export default RemedialContent;
