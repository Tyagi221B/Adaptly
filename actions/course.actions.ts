"use server";

import { ZodError } from "zod";
import dbConnect from "@/lib/mongodb";
import Course from "@/database/course.model";
import Lecture from "@/database/lecture.model";
import { CreateCourseSchema, UpdateCourseSchema } from "@/lib/validations";
import type { CreateCourseInput, UpdateCourseInput } from "@/lib/validations";
import { deleteImage, uploadImage } from "@/lib/cloudinary";

export async function createCourse(formData: FormData) {
  try {
    console.log("[CREATE COURSE] Starting...");
    const instructorId = formData.get("instructorId") as string;
    const thumbnailFile = formData.get("thumbnailFile") as File | null;

    console.log("[CREATE COURSE] Instructor ID:", instructorId);
    console.log("[CREATE COURSE] Thumbnail file:", thumbnailFile ? `Yes (${thumbnailFile.size} bytes, ${thumbnailFile.type})` : "No");

    const data: CreateCourseInput = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as CreateCourseInput["category"],
      instructorMessage: formData.get("instructorMessage") as string,
    };

    const validatedData = CreateCourseSchema.parse(data);

    await dbConnect();

    let thumbnailUrl: string | undefined;
    let thumbnailPublicId: string | undefined;

    // If thumbnail file provided, upload to Cloudinary
    if (thumbnailFile && thumbnailFile.size > 0) {
      console.log("[CREATE COURSE] Converting file to base64...");
      const bytes = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${thumbnailFile.type};base64,${buffer.toString("base64")}`;

      console.log("[CREATE COURSE] Uploading to Cloudinary...");
      const result = await uploadImage(base64, "adaptly/courses");

      console.log("[CREATE COURSE] Upload result:", result);

      if (result.success) {
        thumbnailUrl = result.url;
        thumbnailPublicId = result.publicId;
        console.log("[CREATE COURSE] Thumbnail uploaded successfully!");
      } else {
        console.error("[CREATE COURSE] Upload failed:", result.error);
      }
    } else {
      console.log("[CREATE COURSE] No thumbnail file to upload");
    }

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
          thumbnail: course.thumbnail,
          averageRating: course.averageRating,
          totalReviews: course.totalReviews,
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

export async function updateCourse(formData: FormData) {
  try {
    console.log("[UPDATE COURSE] Starting...");
    const courseId = formData.get("courseId") as string;
    const instructorId = formData.get("instructorId") as string;
    const thumbnailFile = formData.get("thumbnailFile") as File | null;
    const removeThumbnail = formData.get("removeThumbnail") === "true";

    console.log("[UPDATE COURSE] Course ID:", courseId);
    console.log("[UPDATE COURSE] Instructor ID:", instructorId);
    console.log("[UPDATE COURSE] Thumbnail file:", thumbnailFile ? `Yes (${thumbnailFile.size} bytes, ${thumbnailFile.type})` : "No");
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

    // If new thumbnail file provided
    if (thumbnailFile && thumbnailFile.size > 0) {
      console.log("[UPDATE COURSE] New thumbnail file detected");

      // Delete old Cloudinary image if exists
      if (existingCourse.thumbnailPublicId) {
        console.log("[UPDATE COURSE] Deleting old image from Cloudinary:", existingCourse.thumbnailPublicId);
        await deleteImage(existingCourse.thumbnailPublicId);
      }

      // Upload new file to Cloudinary
      console.log("[UPDATE COURSE] Converting new file to base64...");
      const bytes = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${thumbnailFile.type};base64,${buffer.toString("base64")}`;

      console.log("[UPDATE COURSE] Uploading new file to Cloudinary...");
      const result = await uploadImage(base64, "adaptly/courses");

      console.log("[UPDATE COURSE] Upload result:", result);

      if (result.success) {
        thumbnailUrl = result.url;
        thumbnailPublicId = result.publicId;
        console.log("[UPDATE COURSE] New thumbnail uploaded successfully!");
      } else {
        console.error("[UPDATE COURSE] Upload failed:", result.error);
      }
    }
    // If thumbnail is being removed
    else if (removeThumbnail && existingCourse.thumbnailPublicId) {
      console.log("[UPDATE COURSE] Removing thumbnail");
      await deleteImage(existingCourse.thumbnailPublicId);
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
          thumbnail: course.thumbnail,
          instructorName: instructor.name,
          lectureCount,
          averageRating: course.averageRating,
          totalReviews: course.totalReviews,
          enrolledStudentsCount: course.enrolledStudentsCount,
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

// Get featured courses for landing page (top 6 by rating)
export async function getFeaturedCourses() {
  try {
    await dbConnect();

    const courses = await Course.find({ isPublished: true })
      .populate("instructorId", "name email")
      .sort({ averageRating: -1, enrolledStudentsCount: -1 })
      .limit(6)
      .lean();

    const coursesWithDetails = await Promise.all(
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
          thumbnail: course.thumbnail,
          instructorName: instructor.name,
          lectureCount,
          averageRating: course.averageRating,
          totalReviews: course.totalReviews,
          enrolledStudentsCount: course.enrolledStudentsCount,
        };
      })
    );

    return {
      success: true,
      data: coursesWithDetails,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch featured courses",
    };
  }
}

// Get available courses for student (excluding already enrolled)
export async function getAvailableCoursesForStudent(studentId: string) {
  try {
    await dbConnect();

    // Import Enrollment model
    const Enrollment = (await import("@/database/enrollment.model")).default;

    // Get enrolled course IDs
    const enrollments = await Enrollment.find({
      studentId: new (await import("mongoose")).Types.ObjectId(studentId),
    })
      .select("courseId")
      .lean();

    const enrolledCourseIds = enrollments.map((e) => e.courseId.toString());

    // Get all published courses
    const courses = await Course.find({ isPublished: true })
      .populate("instructorId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Filter out enrolled courses
    const availableCourses = courses.filter(
      (course) => !enrolledCourseIds.includes(course._id.toString())
    );

    const coursesWithDetails = await Promise.all(
      availableCourses.map(async (course) => {
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
          thumbnail: course.thumbnail,
          instructorName: instructor.name,
          lectureCount,
          averageRating: course.averageRating,
          totalReviews: course.totalReviews,
          enrolledStudentsCount: course.enrolledStudentsCount,
          createdAt: course.createdAt,
        };
      })
    );

    return {
      success: true,
      data: coursesWithDetails,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch available courses",
    };
  }
}
