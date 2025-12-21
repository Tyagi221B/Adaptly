"use server";

import { ZodError } from "zod";
import dbConnect from "@/lib/mongodb";
import Course from "@/database/course.model";
import Lecture from "@/database/lecture.model";
import Quiz from "@/database/quiz.model";
import { SaveQuizSchema } from "@/lib/validations";
import type { SaveQuizInput } from "@/lib/validations";

export async function saveQuiz(instructorId: string, data: SaveQuizInput) {
  try {
    const validatedData = SaveQuizSchema.parse(data);

    await dbConnect();

    // Verify instructor owns the lecture
    const lecture = await Lecture.findById(validatedData.lectureId);

    if (!lecture) {
      return {
        success: false,
        error: "Lecture not found",
      };
    }

    const course = await Course.findOne({
      _id: lecture.courseId,
      instructorId,
    });

    if (!course) {
      return {
        success: false,
        error: "You don't have access to this lecture",
      };
    }

    // Upsert quiz (create or update)
    const quiz = await Quiz.findOneAndUpdate(
      { lectureId: validatedData.lectureId },
      {
        lectureId: validatedData.lectureId,
        questions: validatedData.questions,
        passingScore: validatedData.passingScore,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return {
      success: true,
      data: {
        quizId: quiz._id.toString(),
        questionCount: quiz.questions.length,
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save quiz",
    };
  }
}

export async function getQuizByLecture(lectureId: string, instructorId: string) {
  try {
    await dbConnect();

    // Verify instructor owns the lecture
    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return {
        success: false,
        error: "Lecture not found",
      };
    }

    const course = await Course.findOne({
      _id: lecture.courseId,
      instructorId,
    });

    if (!course) {
      return {
        success: false,
        error: "You don't have access to this lecture",
      };
    }

    const quiz = await Quiz.findOne({ lectureId }).lean();

    if (!quiz) {
      return {
        success: true,
        data: null, // No quiz exists yet
      };
    }

    return {
      success: true,
      data: {
        _id: quiz._id.toString(),
        questions: quiz.questions,
        passingScore: quiz.passingScore,
        createdAt: quiz.createdAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch quiz",
    };
  }
}

// Get quiz by lecture for students (doesn't check instructor ownership)
export async function getQuizForStudent(lectureId: string) {
  try {
    await dbConnect();

    const quiz = await Quiz.findOne({ lectureId }).lean();

    if (!quiz) {
      return {
        success: true,
        data: null, // No quiz exists
      };
    }

    return {
      success: true,
      data: {
        _id: quiz._id.toString(),
        questions: quiz.questions,
        passingScore: quiz.passingScore,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch quiz",
    };
  }
}

export async function deleteQuiz(lectureId: string, instructorId: string) {
  try {
    await dbConnect();

    // Verify instructor owns the lecture
    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return {
        success: false,
        error: "Lecture not found",
      };
    }

    const course = await Course.findOne({
      _id: lecture.courseId,
      instructorId,
    });

    if (!course) {
      return {
        success: false,
        error: "You don't have access to this lecture",
      };
    }

    await Quiz.deleteOne({ lectureId });

    return {
      success: true,
      message: "Quiz deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete quiz",
    };
  }
}

export async function generateQuizFromLecture(
  lectureId: string,
  instructorId: string,
  questionCount: number = 5
) {
  try {
    await dbConnect();

    // Verify instructor owns the lecture
    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return {
        success: false,
        error: "Lecture not found",
      };
    }

    const course = await Course.findOne({
      _id: lecture.courseId,
      instructorId,
    });

    if (!course) {
      return {
        success: false,
        error: "You don't have access to this lecture",
      };
    }

    // Check if lecture has enough content
    if (lecture.content.length < 100) {
      return {
        success: false,
        error: "Lecture content is too short to generate a quiz. Please add more content.",
      };
    }

    // Call AI to generate questions
    const { generateQuizQuestions } = await import("@/lib/ai");
    const questions = await generateQuizQuestions(lecture.content, questionCount);

    return {
      success: true,
      data: {
        questions,
        lectureTitle: lecture.title,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate quiz",
    };
  }
}
