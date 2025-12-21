"use server";

import dbConnect from "@/lib/mongodb";
import QuizAttempt from "@/database/quiz-attempt.model";
import Quiz from "@/database/quiz.model";
import { Types } from "mongoose";
import type { IStudentAnswer } from "@/database/quiz-attempt.model";

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SubmitQuizInput {
  quizId: string;
  lectureId: string;
  courseId: string;
  answers: Array<{
    questionIndex: number;
    selectedAnswerIndex: number;
  }>;
}

// Submit a quiz attempt
export async function submitQuizAttempt(
  studentId: string,
  input: SubmitQuizInput
): Promise<
  ActionResponse<{
    attemptId: string;
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctAnswers: number;
  }>
> {
  try {
    await dbConnect();

    const { quizId, lectureId, courseId, answers } = input;

    // Fetch the quiz
    const quiz = await Quiz.findById(quizId).lean();

    if (!quiz) {
      return { success: false, error: "Quiz not found" };
    }

    // Validate quiz belongs to lecture
    if (quiz.lectureId.toString() !== lectureId) {
      return { success: false, error: "Quiz does not belong to this lecture" };
    }

    // Check answers and calculate score
    const validatedAnswers: IStudentAnswer[] = answers.map((answer) => {
      const question = quiz.questions[answer.questionIndex];
      const isCorrect = question.correctAnswerIndex === answer.selectedAnswerIndex;

      return {
        questionIndex: answer.questionIndex,
        selectedAnswerIndex: answer.selectedAnswerIndex,
        isCorrect,
      };
    });

    const correctAnswers = validatedAnswers.filter((a) => a.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    // Create quiz attempt
    const attempt = await QuizAttempt.create({
      studentId: new Types.ObjectId(studentId),
      quizId: new Types.ObjectId(quizId),
      lectureId: new Types.ObjectId(lectureId),
      courseId: new Types.ObjectId(courseId),
      answers: validatedAnswers,
      score,
      passed,
    });

    return {
      success: true,
      data: {
        attemptId: attempt._id.toString(),
        score,
        passed,
        totalQuestions,
        correctAnswers,
      },
    };
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    return { success: false, error: "Failed to submit quiz" };
  }
}

// Get latest quiz attempt for a student
export async function getLatestQuizAttempt(
  studentId: string,
  quizId: string
): Promise<
  ActionResponse<{
    _id: string;
    score: number;
    passed: boolean;
    answers: IStudentAnswer[];
    attemptedAt: Date;
  } | null>
> {
  try {
    await dbConnect();

    const attempt = await QuizAttempt.findOne({
      studentId: new Types.ObjectId(studentId),
      quizId: new Types.ObjectId(quizId),
    })
      .sort({ attemptedAt: -1 })
      .limit(1)
      .lean();

    if (!attempt) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        _id: attempt._id.toString(),
        score: attempt.score,
        passed: attempt.passed,
        answers: attempt.answers,
        attemptedAt: attempt.attemptedAt,
      },
    };
  } catch (error) {
    console.error("Error fetching quiz attempt:", error);
    return { success: false, error: "Failed to fetch quiz attempt" };
  }
}

// Get all quiz attempts for a student on a specific lecture
export async function getQuizAttemptsForLecture(
  studentId: string,
  lectureId: string
): Promise<
  ActionResponse<
    Array<{
      _id: string;
      score: number;
      passed: boolean;
      attemptedAt: Date;
    }>
  >
> {
  try {
    await dbConnect();

    const attempts = await QuizAttempt.find({
      studentId: new Types.ObjectId(studentId),
      lectureId: new Types.ObjectId(lectureId),
    })
      .sort({ attemptedAt: -1 })
      .lean();

    const formattedAttempts = attempts.map((attempt) => ({
      _id: attempt._id.toString(),
      score: attempt.score,
      passed: attempt.passed,
      attemptedAt: attempt.attemptedAt,
    }));

    return { success: true, data: formattedAttempts };
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return { success: false, error: "Failed to fetch quiz attempts" };
  }
}

// Get detailed quiz attempt by ID (for results page)
export async function getQuizAttemptById(
  attemptId: string,
  studentId: string
): Promise<
  ActionResponse<{
    _id: string;
    quizId: string;
    lectureId: string;
    courseId: string;
    score: number;
    passed: boolean;
    answers: IStudentAnswer[];
    attemptedAt: Date;
    quiz: {
      questions: Array<{
        questionText: string;
        options: [string, string, string, string];
        correctAnswerIndex: number;
        explanation?: string;
      }>;
      passingScore: number;
    };
    lecture: {
      title: string;
      content: string;
    };
  }>
> {
  try {
    await dbConnect();

    const attempt = await QuizAttempt.findOne({
      _id: new Types.ObjectId(attemptId),
      studentId: new Types.ObjectId(studentId),
    })
      .populate("quizId")
      .populate("lectureId")
      .lean();

    if (!attempt) {
      return { success: false, error: "Quiz attempt not found" };
    }

    const quiz = attempt.quizId as unknown as {
      questions: Array<{
        questionText: string;
        options: [string, string, string, string];
        correctAnswerIndex: number;
        explanation?: string;
      }>;
      passingScore: number;
    };

    const lecture = attempt.lectureId as unknown as {
      title: string;
      content: string;
    };

    return {
      success: true,
      data: {
        _id: attempt._id.toString(),
        quizId: attempt.quizId.toString(),
        lectureId: attempt.lectureId.toString(),
        courseId: attempt.courseId.toString(),
        score: attempt.score,
        passed: attempt.passed,
        answers: attempt.answers,
        attemptedAt: attempt.attemptedAt,
        quiz: {
          questions: quiz.questions,
          passingScore: quiz.passingScore,
        },
        lecture: {
          title: lecture.title,
          content: lecture.content,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching quiz attempt details:", error);
    return { success: false, error: "Failed to fetch quiz attempt details" };
  }
}

// Check if student has passed the quiz
export async function hasPassedQuiz(
  studentId: string,
  quizId: string
): Promise<ActionResponse<{ passed: boolean }>> {
  try {
    await dbConnect();

    const passedAttempt = await QuizAttempt.findOne({
      studentId: new Types.ObjectId(studentId),
      quizId: new Types.ObjectId(quizId),
      passed: true,
    })
      .limit(1)
      .lean();

    return {
      success: true,
      data: { passed: !!passedAttempt },
    };
  } catch (error) {
    console.error("Error checking quiz pass status:", error);
    return { success: false, error: "Failed to check quiz status" };
  }
}
