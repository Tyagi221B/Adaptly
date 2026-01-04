"use server";

import { revalidatePath, updateTag, cacheLife, cacheTag } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Enrollment from "@/database/enrollment.model";
import Course from "@/database/course.model";
import { Types } from "mongoose";

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Enroll in a course
export async function enrollInCourse(
  studentId: string,
  courseId: string
): Promise<ActionResponse<{ enrollmentId: string }>> {
  try {
    await dbConnect();

    // Check if course exists and is published
    const course = await Course.findById(courseId).lean();

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    if (!course.isPublished) {
      return { success: false, error: "This course is not published yet" };
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
    }).lean();

    if (existingEnrollment) {
      return { success: false, error: "You are already enrolled in this course" };
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
      progress: {
        completedLectures: [],
      },
    });

    updateTag('enrollments');
    updateTag('courses');

    revalidatePath('/student/dashboard');
    revalidatePath('/student/discover');

    return {
      success: true,
      data: { enrollmentId: enrollment._id.toString() },
    };
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return { success: false, error: "Failed to enroll in course" };
  }
}

export async function getMyEnrollments(
  studentId: string
): Promise<
  ActionResponse<
    Array<{
      _id: string;
      courseId: string;
      courseTitle: string;
      courseDescription: string;
      courseCategory: string;
      courseThumbnail?: string;
      courseInstructorName: string;
      courseAverageRating: number;
      courseTotalReviews: number;
      courseEnrolledStudentsCount: number;
      enrolledAt: Date;
      totalLectures: number;
      completedLectures: number;
      progressPercentage: number;
    }>
  >
> {
  'use cache'
  cacheLife('minutes')
  cacheTag('enrollments')
  cacheTag('courses')

  try {
    await dbConnect();

    // Use aggregation to join enrollments with courses, instructors, and lecture counts.
    // For 10 enrollments, this reduces 11 queries to just 1.
    const enrollmentsWithDetails = await Enrollment.aggregate([
      // Match enrollments for this student
      { $match: { studentId: new Types.ObjectId(studentId) } },

      // Join with courses collection
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },

      // Unwind course array (should be only one course per enrollment)
      { $unwind: "$course" },

      // Join with users collection to get instructor name
      {
        $lookup: {
          from: "users",
          localField: "course.instructorId",
          foreignField: "_id",
          as: "instructor",
        },
      },

      // Join with lectures collection to get lecture count
      {
        $lookup: {
          from: "lectures",
          localField: "courseId",
          foreignField: "courseId",
          as: "lectures",
        },
      },

      // Join with enrollments collection to count enrolled students
      {
        $lookup: {
          from: "enrollments",
          localField: "courseId",
          foreignField: "courseId",
          as: "courseEnrollments",
        },
      },

      // Calculate progress metrics
      {
        $addFields: {
          totalLectures: { $size: "$lectures" },
          completedLectures: { $size: "$progress.completedLectures" },
          instructorName: { $arrayElemAt: ["$instructor.name", 0] },
          enrolledStudentsCount: { $size: "$courseEnrollments" },
        },
      },

      // Calculate progress percentage
      {
        $addFields: {
          progressPercentage: {
            $cond: {
              if: { $gt: ["$totalLectures", 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$completedLectures", "$totalLectures"] },
                      100,
                    ],
                  },
                  0,
                ],
              },
              else: 0,
            },
          },
        },
      },

      // Remove temporary arrays
      {
        $project: {
          lectures: 0,
          instructor: 0,
          courseEnrollments: 0,
        },
      },

      // Sort by enrollment date (most recent first)
      { $sort: { enrolledAt: -1 } },
    ]);

    // Transform aggregation results to match expected return type
    const formattedEnrollments = enrollmentsWithDetails.map((enrollment) => ({
      _id: enrollment._id.toString(),
      courseId: enrollment.courseId.toString(),
      courseTitle: enrollment.course.title,
      courseDescription: enrollment.course.description,
      courseCategory: enrollment.course.category,
      courseThumbnail: enrollment.course.thumbnail,
      courseInstructorName: enrollment.instructorName || "Unknown",
      courseAverageRating: enrollment.course.averageRating || 0,
      courseTotalReviews: enrollment.course.totalReviews || 0,
      courseEnrolledStudentsCount: enrollment.enrolledStudentsCount || 0,
      enrolledAt: enrollment.enrolledAt,
      totalLectures: enrollment.totalLectures,
      completedLectures: enrollment.completedLectures,
      progressPercentage: enrollment.progressPercentage,
    }));

    return { success: true, data: formattedEnrollments };
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return { success: false, error: "Failed to fetch your enrollments" };
  }
}

export async function isEnrolled(
  studentId: string,
  courseId: string
): Promise<ActionResponse<{ enrolled: boolean; enrollmentId?: string }>> {
  'use cache'
  cacheLife('seconds')
  cacheTag('enrollments')

  try {
    await dbConnect();

    const enrollment = await Enrollment.findOne({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
    }).lean();

    if (!enrollment) {
      return { success: true, data: { enrolled: false } };
    }

    return {
      success: true,
      data: {
        enrolled: true,
        enrollmentId: enrollment._id.toString(),
      },
    };
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return { success: false, error: "Failed to check enrollment status" };
  }
}

// Mark a lecture as completed
export async function markLectureComplete(
  studentId: string,
  courseId: string,
  lectureId: string
): Promise<ActionResponse> {
  try {
    await dbConnect();

    const enrollment = await Enrollment.findOne({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
    });

    if (!enrollment) {
      return { success: false, error: "You are not enrolled in this course" };
    }

    const lectureObjectId = new Types.ObjectId(lectureId);

    // Check if already completed
    const alreadyCompleted = enrollment.progress.completedLectures.some(
      (id: Types.ObjectId) => id.toString() === lectureId
    );

    if (!alreadyCompleted) {
      enrollment.progress.completedLectures.push(lectureObjectId);
      enrollment.progress.lastAccessedLecture = lectureObjectId;
      await enrollment.save();

      updateTag('enrollments');

      revalidatePath(`/student/courses/${courseId}/lectures`);
      revalidatePath('/student/dashboard');
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking lecture as complete:", error);
    return { success: false, error: "Failed to update progress" };
  }
}

export async function getEnrollmentDetails(
  studentId: string,
  courseId: string
): Promise<
  ActionResponse<{
    enrollmentId: string;
    enrolledAt: Date;
    completedLectures: string[];
    lastAccessedLecture?: string;
  }>
> {
  'use cache'
  cacheLife('seconds')
  cacheTag('enrollments')

  try {
    await dbConnect();

    const enrollment = await Enrollment.findOne({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
    }).lean();

    if (!enrollment) {
      return { success: false, error: "You are not enrolled in this course" };
    }

    return {
      success: true,
      data: {
        enrollmentId: enrollment._id.toString(),
        enrolledAt: enrollment.enrolledAt,
        completedLectures: enrollment.progress.completedLectures.map((id: Types.ObjectId) => id.toString()),
        lastAccessedLecture: enrollment.progress.lastAccessedLecture?.toString(),
      },
    };
  } catch (error) {
    console.error("Error fetching enrollment details:", error);
    return { success: false, error: "Failed to fetch enrollment details" };
  }
}

export async function getEnrollmentByCourseId(
  studentId: string,
  courseId: string
) {
  'use cache'
  cacheLife('seconds')
  cacheTag('enrollments')

  try {
    await dbConnect();

    const enrollment = await Enrollment.findOne({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
    })
      .select("progress")
      .lean();

    if (!enrollment) {
      return {
        success: true,
        data: { completedLectures: [] },
      };
    }

    return {
      success: true,
      data: {
        completedLectures: enrollment.progress?.completedLectures || [],
      },
    };
  } catch (error) {
    console.error("Error getting enrollment:", error);
    return {
      success: false,
      error: "Failed to get enrollment",
    };
  }
}
