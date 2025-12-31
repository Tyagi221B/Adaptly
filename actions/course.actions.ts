"use server";

import { ZodError } from "zod";
import { Types } from "mongoose";
import { unstable_cache, revalidateTag } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Course from "@/database/course.model";
import Lecture from "@/database/lecture.model";
import { CreateCourseSchema, UpdateCourseSchema } from "@/lib/validations";
import type { CreateCourseInput, UpdateCourseInput } from "@/lib/validations";
import { deleteImage } from "@/lib/cloudinary";

export async function createCourse(formData: FormData) {
  try {
    console.log("[CREATE COURSE] Starting...");
    const instructorId = formData.get("instructorId") as string;
    const thumbnailUrl = formData.get("thumbnailUrl") as string | null;
    const thumbnailPublicId = formData.get("thumbnailPublicId") as string | null;

    console.log("[CREATE COURSE] Instructor ID:", instructorId);
    console.log("[CREATE COURSE] Thumbnail URL:", thumbnailUrl || "None");
    console.log("[CREATE COURSE] Thumbnail Public ID:", thumbnailPublicId || "None");

    const data: CreateCourseInput = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as CreateCourseInput["category"],
      instructorMessage: formData.get("instructorMessage") as string,
    };

    const validatedData = CreateCourseSchema.parse(data);

    await dbConnect();

    const course = await Course.create({
      ...validatedData,
      thumbnail: thumbnailUrl,
      thumbnailPublicId,
      instructorId,
      isPublished: false,
    });

    console.log("[CREATE COURSE] Course created in DB:");
    console.log("[CREATE COURSE] - ID:", course._id.toString());
    console.log("[CREATE COURSE] - Thumbnail URL:", course.thumbnail);
    console.log("[CREATE COURSE] - Thumbnail Public ID:", course.thumbnailPublicId);

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

    // Use aggregation to get lecture counts in a single query instead of N+1 queries.
    // For 20 courses, this reduces 21 database queries to just 1.
    const coursesWithCount = await Course.aggregate([
      // Match courses owned by this instructor
      // Convert string instructorId to ObjectId for aggregation pipeline
      { $match: { instructorId: new Types.ObjectId(instructorId) } },

      // Join with lectures collection to get lecture count per course
      {
        $lookup: {
          from: "lectures",
          localField: "_id",
          foreignField: "courseId",
          as: "lectures",
        },
      },

      // Calculate lecture count from the joined array
      {
        $addFields: {
          lectureCount: { $size: "$lectures" },
        },
      },

      // Remove the lectures array (we only need the count)
      {
        $project: {
          lectures: 0,
        },
      },

      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } },
    ]);

    // Transform aggregation results to match expected return type
    const formattedCourses = coursesWithCount.map((course) => ({
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      category: course.category,
      thumbnail: course.thumbnail,
      averageRating: course.averageRating,
      totalReviews: course.totalReviews,
      isPublished: course.isPublished,
      lectureCount: course.lectureCount,
      createdAt: course.createdAt,
    }));

    return {
      success: true,
      data: formattedCourses,
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

    // Import Enrollment model
    const Enrollment = (await import("@/database/enrollment.model")).default;

    // Get lectures for this course
    const lectures = await Lecture.find({ courseId })
      .sort({ order: 1 })
      .lean();

    // Get enrollment count for this course
    const enrollmentCount = await Enrollment.countDocuments({ courseId });

    return {
      success: true,
      data: {
        course: {
          _id: course._id.toString(),
          title: course.title,
          description: course.description,
          category: course.category,
          thumbnail: course.thumbnail,
          thumbnailPublicId: course.thumbnailPublicId,
          instructorMessage: course.instructorMessage,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
          enrolledStudentsCount: enrollmentCount,
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

export async function updateCourse(formData: FormData) {
  try {
    console.log("[UPDATE COURSE] Starting...");
    const courseId = formData.get("courseId") as string;
    const instructorId = formData.get("instructorId") as string;
    const newThumbnailUrl = formData.get("thumbnailUrl") as string | null;
    const newThumbnailPublicId = formData.get("thumbnailPublicId") as string | null;
    const removeThumbnail = formData.get("removeThumbnail") === "true";

    console.log("[UPDATE COURSE] Course ID:", courseId);
    console.log("[UPDATE COURSE] Instructor ID:", instructorId);
    console.log("[UPDATE COURSE] New thumbnail URL:", newThumbnailUrl || "None");
    console.log("[UPDATE COURSE] New thumbnail public ID:", newThumbnailPublicId || "None");
    console.log("[UPDATE COURSE] Remove thumbnail flag:", removeThumbnail);

    const data: UpdateCourseInput = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as CreateCourseInput["category"],
      instructorMessage: formData.get("instructorMessage") as string,
    };

    const validatedData = UpdateCourseSchema.parse(data);

    await dbConnect();

    const existingCourse = await Course.findOne({ _id: courseId, instructorId });

    if (!existingCourse) {
      return {
        success: false,
        error: "Course not found or you don't have access",
      };
    }

    console.log("[UPDATE COURSE] Existing thumbnail:", existingCourse.thumbnail);
    console.log("[UPDATE COURSE] Existing publicId:", existingCourse.thumbnailPublicId);

    let thumbnailUrl = existingCourse.thumbnail;
    let thumbnailPublicId = existingCourse.thumbnailPublicId;

    // If new thumbnail URL provided (already uploaded from client)
    if (newThumbnailUrl && newThumbnailPublicId) {
      console.log("[UPDATE COURSE] New thumbnail detected (already uploaded from client)");

      // Delete old Cloudinary image if exists (async, non-blocking)
      if (existingCourse.thumbnailPublicId) {
        console.log("[UPDATE COURSE] Deleting old image from Cloudinary:", existingCourse.thumbnailPublicId);
        // Delete in background - don't await
        deleteImage(existingCourse.thumbnailPublicId).catch(err => {
          console.error("[UPDATE COURSE] Failed to delete old image:", err);
        });
      }

      thumbnailUrl = newThumbnailUrl;
      thumbnailPublicId = newThumbnailPublicId;
      console.log("[UPDATE COURSE] Using new thumbnail from client upload");
    }
    // If thumbnail is being removed
    else if (removeThumbnail && existingCourse.thumbnailPublicId) {
      console.log("[UPDATE COURSE] Removing thumbnail");
      // Delete in background - don't await
      deleteImage(existingCourse.thumbnailPublicId).catch(err => {
        console.error("[UPDATE COURSE] Failed to delete image:", err);
      });
      thumbnailUrl = undefined;
      thumbnailPublicId = undefined;
      console.log("[UPDATE COURSE] Thumbnail removed");
    } else {
      console.log("[UPDATE COURSE] No thumbnail changes");
    }

    const course = await Course.findOneAndUpdate(
      { _id: courseId, instructorId },
      {
        ...validatedData,
        thumbnail: thumbnailUrl,
        thumbnailPublicId,
      },
      { new: true, runValidators: true }
    );

    if (!course) {
      return {
        success: false,
        error: "Course not found or you don't have access",
      };
    }

    console.log("[UPDATE COURSE] Course updated in DB:");
    console.log("[UPDATE COURSE] - ID:", course._id.toString());
    console.log("[UPDATE COURSE] - Thumbnail URL:", course.thumbnail);
    console.log("[UPDATE COURSE] - Thumbnail Public ID:", course.thumbnailPublicId);

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

    // Get the course first to access thumbnailPublicId
    const course = await Course.findOne({
      _id: courseId,
      instructorId,
    });

    if (!course) {
      return {
        success: false,
        error: "Course not found or you don't have access",
      };
    }

    // Delete thumbnail from Cloudinary if it exists
    if (course.thumbnailPublicId) {
      await deleteImage(course.thumbnailPublicId);
    }

    // Delete course
    await Course.deleteOne({ _id: courseId, instructorId });

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

    // Invalidate course catalog caches when publish status changes
    revalidateTag('courses', 'max');
    revalidateTag('published-courses', 'max');
    revalidateTag('featured-courses', 'max');

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
          thumbnail: course.thumbnail,
          thumbnailPublicId: course.thumbnailPublicId,
          instructorMessage: course.instructorMessage,
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
// Cached for 5 minutes - course catalog changes only when instructor publishes
export const getPublishedCourses = unstable_cache(
  async () => {
    try {
      await dbConnect();

      // Use aggregation to join instructors and count lectures in a single query.
      // For 100 published courses, this reduces 101 queries to just 1.
      const coursesWithDetails = await Course.aggregate([
        // Match only published courses
        { $match: { isPublished: true } },

        // Join with users collection to get instructor details
        {
          $lookup: {
            from: "users",
            localField: "instructorId",
            foreignField: "_id",
            as: "instructor",
          },
        },

        // Join with lectures collection to get lecture count
        {
          $lookup: {
            from: "lectures",
            localField: "_id",
            foreignField: "courseId",
            as: "lectures",
          },
        },

        // Calculate lecture count and extract instructor data
        {
          $addFields: {
            lectureCount: { $size: "$lectures" },
            instructorName: { $arrayElemAt: ["$instructor.name", 0] },
          },
        },

        // Remove temporary arrays (we only need the calculated fields)
        {
          $project: {
            lectures: 0,
            instructor: 0,
          },
        },

        // Sort by creation date (newest first)
        { $sort: { createdAt: -1 } },
      ]);

      // Transform aggregation results to match expected return type
      const formattedCourses = coursesWithDetails.map((course) => ({
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        category: course.category,
        thumbnail: course.thumbnail,
        instructorName: course.instructorName,
        lectureCount: course.lectureCount,
        averageRating: course.averageRating,
        totalReviews: course.totalReviews,
        enrolledStudentsCount: course.enrolledStudentsCount,
        createdAt: course.createdAt,
      }));

      return {
        success: true,
        data: formattedCourses,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch courses",
      };
    }
  },
  ['published-courses'],
  {
    revalidate: 300, // 5 minutes
    tags: ['courses', 'published-courses']
  }
);

// Get featured courses for landing page (top 6 by rating)
// Cached for 10 minutes
export const getFeaturedCourses = unstable_cache(
  async () => {
    try {
      await dbConnect();

      // Use aggregation to get top-rated courses with instructor and lecture details.
      // For 6 featured courses, this reduces 7 queries to just 1.
      const featuredCourses = await Course.aggregate([
        // Match only published courses
        { $match: { isPublished: true } },

        // Join with users collection to get instructor details
        {
          $lookup: {
            from: "users",
            localField: "instructorId",
            foreignField: "_id",
            as: "instructor",
          },
        },

        // Join with lectures collection to get lecture count
        {
          $lookup: {
            from: "lectures",
            localField: "_id",
            foreignField: "courseId",
            as: "lectures",
          },
        },

        // Calculate lecture count and extract instructor data
        {
          $addFields: {
            lectureCount: { $size: "$lectures" },
            instructorName: { $arrayElemAt: ["$instructor.name", 0] },
          },
        },

        // Remove temporary arrays
        {
          $project: {
            lectures: 0,
            instructor: 0,
          },
        },

        // Sort by rating (highest first), then by enrollment count
        { $sort: { averageRating: -1, enrolledStudentsCount: -1 } },

        // Limit to top 6 courses
        { $limit: 6 },
      ]);

      // Transform aggregation results to match expected return type
      const formattedCourses = featuredCourses.map((course) => ({
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        category: course.category,
        thumbnail: course.thumbnail,
        instructorName: course.instructorName,
        lectureCount: course.lectureCount,
        averageRating: course.averageRating,
        totalReviews: course.totalReviews,
        enrolledStudentsCount: course.enrolledStudentsCount,
      }));

      return {
        success: true,
        data: formattedCourses,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch featured courses",
      };
    }
  },
  ['featured-courses'],
  {
    revalidate: 600, // 10 minutes
    tags: ['courses', 'featured-courses']
  }
);

// Get available courses for student (excluding already enrolled)
// Cached for 2 minutes per student
export const getAvailableCoursesForStudent = unstable_cache(
  async (studentId: string) => {
    try {
      await dbConnect();

      const { Types } = await import("mongoose");
      const Enrollment = (await import("@/database/enrollment.model")).default;
      const studentObjectId = new Types.ObjectId(studentId);

      // First, get enrolled course IDs for this student
      const enrolledCourseIds = await Enrollment.find({ studentId: studentObjectId })
        .select("courseId")
        .lean()
        .then((enrollments) => enrollments.map((e) => e.courseId));

      // Use aggregation to get published courses with all details, excluding enrolled courses.
      // This reduces N+2 queries to just 2 queries (1 for enrollments, 1 for available courses).
      const availableCourses = await Course.aggregate([
        // Match published courses that student hasn't enrolled in
        {
          $match: {
            isPublished: true,
            _id: { $nin: enrolledCourseIds },
          },
        },

        // Join with users collection to get instructor details
        {
          $lookup: {
            from: "users",
            localField: "instructorId",
            foreignField: "_id",
            as: "instructor",
          },
        },

        // Join with lectures collection to get lecture count
        {
          $lookup: {
            from: "lectures",
            localField: "_id",
            foreignField: "courseId",
            as: "lectures",
          },
        },

        // Calculate lecture count and extract instructor data
        {
          $addFields: {
            lectureCount: { $size: "$lectures" },
            instructorName: { $arrayElemAt: ["$instructor.name", 0] },
          },
        },

        // Remove temporary arrays
        {
          $project: {
            lectures: 0,
            instructor: 0,
          },
        },

        // Sort by creation date (newest first)
        { $sort: { createdAt: -1 } },
      ]);

      // Transform aggregation results to match expected return type
      const formattedCourses = availableCourses.map((course) => ({
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        category: course.category,
        thumbnail: course.thumbnail,
        instructorName: course.instructorName,
        lectureCount: course.lectureCount,
        averageRating: course.averageRating,
        totalReviews: course.totalReviews,
        enrolledStudentsCount: course.enrolledStudentsCount,
        createdAt: course.createdAt,
      }));

      return {
        success: true,
        data: formattedCourses,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch available courses",
      };
    }
  },
  ['available-courses'],
  {
    revalidate: 120,
    tags: ['courses', 'available-courses']
  }
);
