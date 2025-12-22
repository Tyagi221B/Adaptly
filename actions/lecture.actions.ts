"use server";

import { ZodError } from "zod";
import dbConnect from "@/lib/mongodb";
import Course from "@/database/course.model";
import Lecture from "@/database/lecture.model";
import { CreateLectureSchema, UpdateLectureSchema } from "@/lib/validations";
import type { CreateLectureInput, UpdateLectureInput } from "@/lib/validations";

export async function createLecture(instructorId: string, data: CreateLectureInput) {
  try {
    const validatedData = CreateLectureSchema.parse(data);

    await dbConnect();

    // Verify instructor owns the course
    const course = await Course.findOne({
      _id: validatedData.courseId,
      instructorId,
    });

    if (!course) {
      return {
        success: false,
        error: "Course not found or you don't have access",
      };
    }

    const lecture = await Lecture.create(validatedData);

    return {
      success: true,
      data: {
        lectureId: lecture._id.toString(),
        title: lecture.title,
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
      error: error instanceof Error ? error.message : "Failed to create lecture",
    };
  }
}

export async function getLecturesByCourse(courseId: string, instructorId: string) {
  try {
    await dbConnect();

    // Verify instructor owns the course
    const course = await Course.findOne({ _id: courseId, instructorId });

    if (!course) {
      return {
        success: false,
        error: "Course not found or you don't have access",
      };
    }

    const lectures = await Lecture.find({ courseId }).sort({ order: 1 }).lean();

    return {
      success: true,
      data: lectures.map((lecture) => ({
        _id: lecture._id.toString(),
        title: lecture.title,
        order: lecture.order,
        contentPreview: lecture.content.substring(0, 100) + "...",
        createdAt: lecture.createdAt,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch lectures",
    };
  }
}

export async function getLectureById(lectureId: string, instructorId: string) {
  try {
    await dbConnect();

    const lecture = await Lecture.findById(lectureId).lean();

    if (!lecture) {
      return {
        success: false,
        error: "Lecture not found",
      };
    }

    // Verify instructor owns the course
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

    return {
      success: true,
      data: {
        _id: lecture._id.toString(),
        courseId: lecture.courseId.toString(),
        title: lecture.title,
        content: lecture.content,
        pdfUrl: lecture.pdfUrl,
        order: lecture.order,
        createdAt: lecture.createdAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch lecture",
    };
  }
}

// Get lecture by ID for students (doesn't check instructor ownership)
export async function getLectureForStudent(lectureId: string) {
  try {
    await dbConnect();

    const lecture = await Lecture.findById(lectureId).lean();

    if (!lecture) {
      return {
        success: false,
        error: "Lecture not found",
      };
    }

    return {
      success: true,
      data: {
        _id: lecture._id.toString(),
        courseId: lecture.courseId.toString(),
        title: lecture.title,
        content: lecture.content,
        order: lecture.order,
        createdAt: lecture.createdAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch lecture",
    };
  }
}

export async function updateLecture(
  lectureId: string,
  instructorId: string,
  data: UpdateLectureInput
) {
  try {
    const validatedData = UpdateLectureSchema.parse(data);

    await dbConnect();

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return {
        success: false,
        error: "Lecture not found",
      };
    }

    // Verify instructor owns the course
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

    Object.assign(lecture, validatedData);
    await lecture.save();

    return {
      success: true,
      data: {
        lectureId: lecture._id.toString(),
        title: lecture.title,
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
      error: error instanceof Error ? error.message : "Failed to update lecture",
    };
  }
}

export async function deleteLecture(lectureId: string, instructorId: string) {
  try {
    await dbConnect();

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return {
        success: false,
        error: "Lecture not found",
      };
    }

    // Verify instructor owns the course
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

    await lecture.deleteOne();

    return {
      success: true,
      message: "Lecture deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete lecture",
    };
  }
}

export async function getNextLectureOrder(courseId: string) {
  try {
    await dbConnect();

    const lastLecture = await Lecture.findOne({ courseId })
      .sort({ order: -1 })
      .limit(1)
      .lean();

    return {
      success: true,
      data: {
        nextOrder: lastLecture ? lastLecture.order + 1 : 1,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get next order",
    };
  }
}

export async function getCourseLectures(courseId: string, _studentId: string) {
  try {
    await dbConnect();

    // Verify course exists and is published
    const course = await Course.findById(courseId);
    if (!course || !course.isPublished) {
      return {
        success: false,
        error: "Course not found",
      };
    }

    // Get all lectures for the course
    const lectures = await Lecture.find({ courseId })
      .select("_id title order")
      .sort({ order: 1 })
      .lean();

    return {
      success: true,
      data: lectures.map((lecture) => ({
        _id: lecture._id.toString(),
        title: lecture.title,
        order: lecture.order,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get lectures",
    };
  }
}
