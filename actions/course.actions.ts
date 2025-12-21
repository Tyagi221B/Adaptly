"use server";

import { ZodError } from "zod";
import dbConnect from "@/lib/mongodb";
import Course from "@/database/course.model";
import Lecture from "@/database/lecture.model";
import { CreateCourseSchema, UpdateCourseSchema } from "@/lib/validations";
import type { CreateCourseInput, UpdateCourseInput } from "@/lib/validations";

export async function createCourse(instructorId: string, data: CreateCourseInput) {
  try {
    const validatedData = CreateCourseSchema.parse(data);

    await dbConnect();

    const course = await Course.create({
      ...validatedData,
      instructorId,
      isPublished: false,
    });

    return {
      success: true,
      data: {
        courseId: course._id.toString(),
        title: course.title,
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
      error: error instanceof Error ? error.message : "Failed to create course",
    };
  }
}

export async function getMyCourses(instructorId: string) {
  try {
    await dbConnect();

    const courses = await Course.find({ instructorId })
      .sort({ createdAt: -1 })
      .lean();

    // Get lecture count for each course
    const coursesWithCount = await Promise.all(
      courses.map(async (course) => {
        const lectureCount = await Lecture.countDocuments({
          courseId: course._id,
        });

        return {
          _id: course._id.toString(),
          title: course.title,
          description: course.description,
          category: course.category,
          isPublished: course.isPublished,
          lectureCount,
          createdAt: course.createdAt,
        };
      })
    );

    return {
      success: true,
      data: coursesWithCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch courses",
    };
  }
}

export async function getCourseById(courseId: string, instructorId: string) {
  try {
    await dbConnect();

    const course = await Course.findOne({
      _id: courseId,
      instructorId, // Ensure instructor owns this course
    }).lean();

    if (!course) {
      return {
        success: false,
        error: "Course not found or you don't have access",
      };
    }

    // Get lectures for this course
    const lectures = await Lecture.find({ courseId })
      .sort({ order: 1 })
      .lean();

    return {
      success: true,
      data: {
        course: {
          _id: course._id.toString(),
          title: course.title,
          description: course.description,
          category: course.category,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
        },
        lectures: lectures.map((lecture) => ({
          _id: lecture._id.toString(),
          title: lecture.title,
          order: lecture.order,
          createdAt: lecture.createdAt,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch course",
    };
  }
}

export async function updateCourse(
  courseId: string,
  instructorId: string,
  data: UpdateCourseInput
) {
  try {
    const validatedData = UpdateCourseSchema.parse(data);

    await dbConnect();

    const course = await Course.findOneAndUpdate(
      { _id: courseId, instructorId },
      validatedData,
      { new: true, runValidators: true }
    );

    if (!course) {
      return {
        success: false,
        error: "Course not found or you don't have access",
      };
    }

    return {
      success: true,
      data: {
        courseId: course._id.toString(),
        title: course.title,
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
      error: error instanceof Error ? error.message : "Failed to update course",
    };
  }
}

export async function deleteCourse(courseId: string, instructorId: string) {
  try {
    await dbConnect();

    // Delete course
    const course = await Course.findOneAndDelete({
      _id: courseId,
      instructorId,
    });

    if (!course) {
      return {
        success: false,
        error: "Course not found or you don't have access",
      };
    }

    // Delete all lectures associated with this course
    await Lecture.deleteMany({ courseId });

    return {
      success: true,
      message: "Course deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete course",
    };
  }
}

export async function toggleCoursePublish(courseId: string, instructorId: string) {
  try {
    await dbConnect();

    const course = await Course.findOne({ _id: courseId, instructorId });

    if (!course) {
      return {
        success: false,
        error: "Course not found or you don't have access",
      };
    }

    course.isPublished = !course.isPublished;
    await course.save();

    return {
      success: true,
      data: {
        isPublished: course.isPublished,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle publish status",
    };
  }
}

// Get course details for students (doesn't check instructor ownership)
export async function getCourseForStudent(courseId: string) {
  try {
    await dbConnect();

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return {
        success: false,
        error: "Course not found",
      };
    }

    // Get lectures for this course
    const lectures = await Lecture.find({ courseId })
      .sort({ order: 1 })
      .lean();

    return {
      success: true,
      data: {
        course: {
          _id: course._id.toString(),
          title: course.title,
          description: course.description,
          category: course.category,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
        },
        lectures: lectures.map((lecture) => ({
          _id: lecture._id.toString(),
          title: lecture.title,
          order: lecture.order,
          createdAt: lecture.createdAt,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch course",
    };
  }
}

// Get all published courses for students (catalog)
export async function getPublishedCourses() {
  try {
    await dbConnect();

    const courses = await Course.find({ isPublished: true })
      .populate("instructorId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const coursesWithCount = await Promise.all(
      courses.map(async (course) => {
        const lectureCount = await Lecture.countDocuments({
          courseId: course._id,
        });

        const instructor = course.instructorId as unknown as {
          name: string;
          email: string;
        };

        return {
          _id: course._id.toString(),
          title: course.title,
          description: course.description,
          category: course.category,
          instructorName: instructor.name,
          lectureCount,
          createdAt: course.createdAt,
        };
      })
    );

    return {
      success: true,
      data: coursesWithCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch courses",
    };
  }
}
