import { Schema, model, models, Document, Types } from "mongoose";

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  enrolledAt: Date;
  progress: {
    completedLectures: Types.ObjectId[];
    lastAccessedLecture?: Types.ObjectId;
    completionPercentage: number;
  };
  lastActiveAt: Date;
  quizPerformance: {
    totalAttempts: number;
    averageScore: number;
    passedQuizzes: number;
    totalQuizzes: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
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
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      completedLectures: [
        {
          type: Schema.Types.ObjectId,
          ref: "Lecture",
        },
      ],
      lastAccessedLecture: {
        type: Schema.Types.ObjectId,
        ref: "Lecture",
      },
      completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    quizPerformance: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      passedQuizzes: {
        type: Number,
        default: 0,
      },
      totalQuizzes: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only enroll once per course
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment = models.Enrollment || model<IEnrollment>("Enrollment", EnrollmentSchema);

export default Enrollment;
