"use server";

import dbConnect from "@/lib/mongodb";
import Enrollment from "@/database/enrollment.model";
import Course from "@/database/course.model";
import Lecture from "@/database/lecture.model";
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

    return {
      success: true,
      data: { enrollmentId: enrollment._id.toString() },
    };
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return { success: false, error: "Failed to enroll in course" };
  }
}

// Get student's enrollments with course details
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
      enrolledAt: Date;
      totalLectures: number;
      completedLectures: number;
      progressPercentage: number;
    }>
  >
> {
  try {
    await dbConnect();

    const enrollments = await Enrollment.find({
      studentId: new Types.ObjectId(studentId),
    })
      .populate("courseId")
      .sort({ enrolledAt: -1 })
      .lean();

    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.courseId as unknown as {
          _id: Types.ObjectId;
          title: string;
          description: string;
          category: string;
        };

        const totalLectures = await Lecture.countDocuments({
          courseId: course._id,
        });

        const completedLectures = enrollment.progress.completedLectures.length;
        const progressPercentage =
          totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

        return {
          _id: enrollment._id.toString(),
          courseId: course._id.toString(),
          courseTitle: course.title,
          courseDescription: course.description,
          courseCategory: course.category,
          enrolledAt: enrollment.enrolledAt,
          totalLectures,
          completedLectures,
          progressPercentage,
        };
      })
    );

    return { success: true, data: enrollmentsWithProgress };
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return { success: false, error: "Failed to fetch your enrollments" };
  }
}

// Check if student is enrolled in a course
export async function isEnrolled(
  studentId: string,
  courseId: string
): Promise<ActionResponse<{ enrolled: boolean; enrollmentId?: string }>> {
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
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking lecture as complete:", error);
    return { success: false, error: "Failed to update progress" };
  }
}

// Get enrollment details for a specific course
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
