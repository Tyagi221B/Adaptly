import { Schema, model, models, Document, Types } from "mongoose";

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  enrolledAt: Date;
  progress: {
    completedLectures: Types.ObjectId[];
    lastAccessedLecture?: Types.ObjectId;
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
