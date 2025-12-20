import { Schema, model, models, Document, Types } from "mongoose";

export interface IQuestion {
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface IQuiz extends Document {
  _id: Types.ObjectId;
  lectureId: Types.ObjectId;
  questions: IQuestion[];
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      minlength: [10, "Question must be at least 10 characters"],
    },
    options: {
      type: [String],
      required: [true, "Options are required"],
      validate: {
        validator: function (v: string[]) {
          return v.length === 4;
        },
        message: "Must have exactly 4 options",
      },
    },
    correctAnswerIndex: {
      type: Number,
      required: [true, "Correct answer index is required"],
      min: [0, "Index must be between 0 and 3"],
      max: [3, "Index must be between 0 and 3"],
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const QuizSchema = new Schema<IQuiz>(
  {
    lectureId: {
      type: Schema.Types.ObjectId,
      ref: "Lecture",
      required: [true, "Lecture ID is required"],
      unique: true, // One quiz per lecture
      index: true,
    },
    questions: {
      type: [QuestionSchema],
      required: [true, "Questions are required"],
      validate: {
        validator: function (v: IQuestion[]) {
          return v.length >= 3 && v.length <= 15;
        },
        message: "Quiz must have between 3 and 15 questions",
      },
    },
    passingScore: {
      type: Number,
      required: [true, "Passing score is required"],
      min: [0, "Passing score must be between 0 and 100"],
      max: [100, "Passing score must be between 0 and 100"],
      default: 70,
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = models.Quiz || model<IQuiz>("Quiz", QuizSchema);

export default Quiz;
