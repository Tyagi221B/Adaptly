import { Schema, model, models, Document, Types } from "mongoose";

export interface IMisconception extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  lectureId: Types.ObjectId;
  quizId: Types.ObjectId;
  questionIndex: number;
  questionText: string;
  wrongAnswerIndex: number;
  wrongAnswerText: string;
  correctAnswerIndex: number;
  correctAnswerText: string;
  count: number; // How many students chose this wrong answer
  studentIds: Types.ObjectId[]; // Which students made this mistake
  lastOccurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MisconceptionSchema = new Schema<IMisconception>(
  {
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
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    questionIndex: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    wrongAnswerIndex: {
      type: Number,
      required: true,
    },
    wrongAnswerText: {
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
    count: {
      type: Number,
      default: 1,
      min: 1,
    },
    studentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastOccurredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique pattern: one misconception per (quiz, question, wrong answer)
MisconceptionSchema.index(
  { quizId: 1, questionIndex: 1, wrongAnswerIndex: 1 },
  { unique: true }
);

// Index for top misconceptions per course (sorted by count)
MisconceptionSchema.index({ courseId: 1, count: -1 });

// Index for misconceptions per lecture
MisconceptionSchema.index({ lectureId: 1, count: -1 });

const Misconception = models.Misconception || model<IMisconception>("Misconception", MisconceptionSchema);

export default Misconception;
