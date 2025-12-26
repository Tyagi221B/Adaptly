"use server";

import dbConnect from "@/lib/mongodb";
import QuizAttempt from "@/database/quiz-attempt.model";
import Quiz from "@/database/quiz.model";
import { Types } from "mongoose";
import type { IStudentAnswer } from "@/database/quiz-attempt.model";
import {
  aiRemedialContentLimiter,
  getRateLimitIdentifier,
  formatResetTime,
} from "@/lib/rate-limit";
import { generateRemedialContent as generateRemedialContentAI, type WrongAnswer } from "@/lib/ai";
import { markLectureComplete } from "./enrollment.actions";

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
        questionText: question.questionText,
        selectedAnswerIndex: answer.selectedAnswerIndex,
        selectedAnswerText: question.options[answer.selectedAnswerIndex],
        correctAnswerIndex: question.correctAnswerIndex,
        correctAnswerText: question.options[question.correctAnswerIndex],
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

    // Mark lecture as complete if quiz was passed
    if (passed) {
      await markLectureComplete(studentId, courseId, lectureId);
    }

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

/**
 * Generate personalized remedial content based on student's wrong answers
 * Includes rate limiting to prevent AI API abuse
 */
export async function generateRemedialContent(
  studentId: string,
  lectureContent: string,
  wrongAnswers: WrongAnswer[]
): Promise<ActionResponse<{ content: string }>> {
  try {
    // Apply rate limiting
    const identifier = getRateLimitIdentifier(studentId);
    const rateLimitResult = aiRemedialContentLimiter.check(identifier);

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: `Rate limit exceeded. Please try again in ${formatResetTime(rateLimitResult.resetTime)}.`,
      };
    }

    // Generate remedial content using AI
    const content = await generateRemedialContentAI(lectureContent, wrongAnswers);

    return {
      success: true,
      data: { content },
    };
  } catch (error) {
    console.error("Failed to generate remedial content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate remedial content",
    };
  }
}

/**
 * Regenerate remedial content for testing purposes (dev-only)
 * Bypasses rate limiting to allow quick iteration on prompt changes
 */
export async function regenerateRemedialContentForTesting(
  studentId: string,
  attemptId: string
): Promise<ActionResponse<{ content: string }>> {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return { success: false, error: "Not available in production" };
    }

    await dbConnect();

    // Get the attempt with quiz and lecture data
    const attempt = await QuizAttempt.findOne({
      _id: new Types.ObjectId(attemptId),
      studentId: new Types.ObjectId(studentId),
    })
      .populate("quizId")
      .populate("lectureId")
      .lean();

    if (!attempt) {
      return { success: false, error: "Attempt not found" };
    }

    // Extract wrong answers
    const quiz = attempt.quizId as unknown as {
      questions: Array<{
        questionText: string;
        options: [string, string, string, string];
        correctAnswerIndex: number;
        explanation?: string;
      }>;
    };

    const lecture = attempt.lectureId as unknown as {
      content: string;
    };

    const wrongAnswers: WrongAnswer[] = attempt.answers
      .filter((answer: IStudentAnswer) => !answer.isCorrect)
      .map((answer: IStudentAnswer) => {
        const question = quiz.questions[answer.questionIndex];
        return {
          questionText: question.questionText,
          correctAnswer: question.options[question.correctAnswerIndex],
          studentAnswer: question.options[answer.selectedAnswerIndex],
          explanation: question.explanation,
        };
      });

    // Regenerate content (skip rate limiting for dev testing)
    const content = await generateRemedialContentAI(lecture.content, wrongAnswers);

    return {
      success: true,
      data: { content },
    };
  } catch (error) {
    console.error("Failed to regenerate remedial content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to regenerate content",
    };
  }
}
