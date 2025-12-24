import { Schema, model, models, Document, Types } from "mongoose";

export interface IStudentAnswer {
  questionIndex: number;
  questionText: string;
  selectedAnswerIndex: number;
  selectedAnswerText: string;
  correctAnswerIndex: number;
  correctAnswerText: string;
  isCorrect: boolean;
}

export interface IQuizAttempt extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  quizId: Types.ObjectId;
  lectureId: Types.ObjectId;
  courseId: Types.ObjectId;
  answers: IStudentAnswer[];
  score: number; // Percentage (0-100)
  passed: boolean;
  attemptedAt: Date;
  remedialContentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    lectureId: {
      type: Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    answers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        questionText: {
          type: String,
          required: true,
        },
        selectedAnswerIndex: {
          type: Number,
          required: true,
        },
        selectedAnswerText: {
          type: String,
          required: true,
        },
        correctAnswerIndex: {
          type: Number,
          required: true,
        },
        correctAnswerText: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
    remedialContentId: {
      type: Schema.Types.ObjectId,
      ref: "RemedialContent",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding student's attempts for a specific quiz
QuizAttemptSchema.index({ studentId: 1, quizId: 1 });

// Index for finding all attempts for a lecture
QuizAttemptSchema.index({ studentId: 1, lectureId: 1 });

const QuizAttempt = models.QuizAttempt || model<IQuizAttempt>("QuizAttempt", QuizAttemptSchema);

export default QuizAttempt;
