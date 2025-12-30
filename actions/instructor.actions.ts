"use server";

import { Types } from "mongoose";
import dbConnect from "@/lib/mongodb";
import Enrollment from "@/database/enrollment.model";
import Lecture from "@/database/lecture.model";
import QuizAttempt from "@/database/quiz-attempt.model";
import User from "@/database/user.model";
// Type definitions
interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Type definitions for instructor analytics
export interface EnrolledStudent {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  enrolledAt: Date;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  quizzes: {
    passed: number;
    total: number;
    averageScore: number;
  };
}

// Get all students across all instructor's courses
export async function getAllInstructorStudents(
  instructorId: string
): Promise<ActionResponse<EnrolledStudent[]>> {
  try {
    await dbConnect();

    // Get all courses by this instructor
    const Course = (await import("@/database/course.model")).default;
    const courses = await Course.find({ instructorId })
      .select("_id")
      .lean();

    if (courses.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const courseIds = courses.map((c) => c._id);

    // Get all enrollments for instructor's courses
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate("studentId", "name email profilePicture")
      .populate("courseId", "title")
      .sort({ enrolledAt: -1 })
      .lean();

    if (enrollments.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Get unique students
    const studentMap = new Map();
    const allStudentIds: Types.ObjectId[] = [];

    interface PopulatedEnrollmentData {
      studentId: {
        _id: Types.ObjectId;
        name: string;
        email: string;
        profilePicture?: string;
      };
      courseId: {
        _id: Types.ObjectId;
        title: string;
      };
      progress: {
        completedLectures: Types.ObjectId[];
      };
      enrolledAt: Date;
    }

    (enrollments as unknown as PopulatedEnrollmentData[]).forEach((enrollment) => {
      const studentId = enrollment.studentId._id.toString();
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          _id: studentId,
          name: enrollment.studentId.name,
          email: enrollment.studentId.email,
          profilePicture: enrollment.studentId.profilePicture,
          enrollments: [],
          totalCompleted: 0,
          totalLectures: 0,
        });
        allStudentIds.push(enrollment.studentId._id);
      }

      const student = studentMap.get(studentId);
      student.enrollments.push({
        courseId: enrollment.courseId._id.toString(),
        courseTitle: enrollment.courseId.title,
        completed: enrollment.progress.completedLectures.length,
        enrolledAt: enrollment.enrolledAt,
      });
      student.totalCompleted += enrollment.progress.completedLectures.length;
    });

    // Get unique enrolled course IDs from enrollments
    const enrolledCourseIds = Array.from(
      new Set(
        (enrollments as unknown as PopulatedEnrollmentData[]).map((e) =>
          e.courseId._id.toString()
        )
      )
    ).map((id) => new Types.ObjectId(id));

    // Get lecture counts for enrolled courses only
    const lectureCounts = await Lecture.aggregate([
      { $match: { courseId: { $in: enrolledCourseIds } } },
      { $group: { _id: "$courseId", count: { $sum: 1 } } },
    ]);

    interface LectureCountResult {
      _id: Types.ObjectId;
      count: number;
    }

    const lectureCountMap = new Map<string, number>();
    (lectureCounts as LectureCountResult[]).forEach((lc) => {
      lectureCountMap.set(lc._id.toString(), lc.count);
    });

    // Update total lectures for each student
    studentMap.forEach((student) => {
      student.enrollments.forEach(
        (e: { courseId: string; completed: number }) => {
          const lectureCount = lectureCountMap.get(e.courseId) || 0;
          student.totalLectures += lectureCount;
        }
      );
    });

    // Get all quiz attempts for these students across instructor's courses
    const quizAttempts = await QuizAttempt.find({
      studentId: { $in: allStudentIds },
      courseId: { $in: courseIds },
    })
      .select("studentId score passed")
      .lean();

    interface QuizAttemptData {
      studentId: Types.ObjectId;
      score: number;
      passed: boolean;
    }

    // Calculate quiz stats for each student
    const studentsWithStats: EnrolledStudent[] = Array.from(
      studentMap.values()
    ).map((student) => {
      const studentQuizAttempts = (
        quizAttempts as unknown as QuizAttemptData[]
      ).filter((attempt) => attempt.studentId.toString() === student._id);

      const totalQuizAttempts = studentQuizAttempts.length;
      const passedQuizzes = studentQuizAttempts.filter((a) => a.passed).length;
      const averageScore =
        totalQuizAttempts > 0
          ? Math.round(
              studentQuizAttempts.reduce((sum: number, a) => sum + a.score, 0) /
                totalQuizAttempts
            )
          : 0;

      const progressPercentage =
        student.totalLectures > 0
          ? Math.round((student.totalCompleted / student.totalLectures) * 100)
          : 0;

      // Get earliest enrollment date
      const enrolledAt =
        student.enrollments.length > 0
          ? student.enrollments.reduce(
              (earliest: Date, e: { enrolledAt: Date }) => {
                return e.enrolledAt < earliest ? e.enrolledAt : earliest;
              },
              student.enrollments[0].enrolledAt
            )
          : new Date();

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        profilePicture: student.profilePicture,
        enrolledAt,
        progress: {
          completed: student.totalCompleted,
          total: student.totalLectures,
          percentage: progressPercentage,
        },
        quizzes: {
          passed: passedQuizzes,
          total: totalQuizAttempts,
          averageScore,
        },
      };
    });

    return {
      success: true,
      data: studentsWithStats,
    };
  } catch (error) {
    console.error("Error fetching all instructor students:", error);
    return {
      success: false,
      error: "Failed to fetch students",
    };
  }
}

// Get total student count for instructor
export async function getInstructorStudentCount(
  instructorId: string
): Promise<ActionResponse<number>> {
  try {
    await dbConnect();

    // Get all courses by this instructor
    const Course = (await import("@/database/course.model")).default;
    const courses = await Course.find({ instructorId })
      .select("_id")
      .lean();

    if (courses.length === 0) {
      return {
        success: true,
        data: 0,
      };
    }

    const courseIds = courses.map((c) => c._id);

    // Count unique students enrolled in any of these courses
    const uniqueStudents = await Enrollment.distinct("studentId", {
      courseId: { $in: courseIds },
    });

    return {
      success: true,
      data: uniqueStudents.length,
    };
  } catch (error) {
    console.error("Error fetching instructor student count:", error);
    return {
      success: false,
      error: "Failed to fetch student count",
    };
  }
}

// Get student progress across all instructor's courses
export async function getStudentProgressAcrossInstructorCourses(
  studentId: string,
  instructorId: string
): Promise<
  ActionResponse<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentAvatar?: string;
    totalEnrollments: number;
    overallProgress: {
      completed: number;
      total: number;
      percentage: number;
    };
    overallQuizzes: {
      totalAttempts: number;
      passed: number;
      failed: number;
      averageScore: number;
    };
    courses: Array<{
      courseId: string;
      courseTitle: string;
      enrolledAt: Date;
      progress: {
        completed: number;
        total: number;
        percentage: number;
      };
      quizzes: {
        totalAttempts: number;
        passed: number;
        averageScore: number;
      };
    }>;
  }>
> {
  try {
    await dbConnect();

    // Get student info
    const student = await User.findById(studentId)
      .select("name email profilePicture")
      .lean();

    if (!student) {
      return {
        success: false,
        error: "Student not found",
      };
    }

    // Get all courses by this instructor
    const Course = (await import("@/database/course.model")).default;
    const courses = await Course.find({ instructorId })
      .select("_id title")
      .lean();

    if (courses.length === 0) {
      return {
        success: false,
        error: "No courses found",
      };
    }

    const courseIds = courses.map((c) => c._id);

    // Get all enrollments for this student in instructor's courses
    const enrollments = await Enrollment.find({
      studentId,
      courseId: { $in: courseIds },
    })
      .populate("courseId", "title")
      .sort({ enrolledAt: -1 })
      .lean();

    if (enrollments.length === 0) {
      return {
        success: false,
        error: "Student is not enrolled in any of your courses",
      };
    }

    interface PopulatedEnrollmentWithCourse {
      courseId: {
        _id: Types.ObjectId;
        title: string;
      };
      progress: {
        completedLectures: Types.ObjectId[];
      };
      enrolledAt: Date;
    }

    // Get lecture counts for enrolled courses
    // Extract courseId._id from populated enrollments
    const enrolledCourseIds = (
      enrollments as unknown as PopulatedEnrollmentWithCourse[]
    ).map((e) => e.courseId._id);

    const lectureCounts = await Lecture.aggregate([
      { $match: { courseId: { $in: enrolledCourseIds } } },
      { $group: { _id: "$courseId", count: { $sum: 1 } } },
    ]);

    interface LectureCountResult {
      _id: Types.ObjectId;
      count: number;
    }

    const lectureCountMap = new Map<string, number>();
    (lectureCounts as LectureCountResult[]).forEach((lc) => {
      lectureCountMap.set(lc._id.toString(), lc.count);
    });

    // Get all quiz attempts for this student in instructor's courses
    const quizAttempts = await QuizAttempt.find({
      studentId,
      courseId: { $in: courseIds },
    })
      .select("courseId score passed")
      .lean();

    interface QuizAttemptWithCourse {
      courseId: Types.ObjectId;
      score: number;
      passed: boolean;
    }

    // Build course progress data
    let totalCompleted = 0;
    let totalLectures = 0;
    const courseProgress = (
      enrollments as unknown as PopulatedEnrollmentWithCourse[]
    ).map((enrollment) => {
      const courseId = enrollment.courseId._id.toString();
      const lectureCount = lectureCountMap.get(courseId) || 0;
      const completed = enrollment.progress.completedLectures.length;

      totalCompleted += completed;
      totalLectures += lectureCount;

      // Get quiz attempts for this course
      const courseQuizAttempts = (
        quizAttempts as unknown as QuizAttemptWithCourse[]
      ).filter((attempt) => attempt.courseId.toString() === courseId);

      const totalAttempts = courseQuizAttempts.length;
      const passed = courseQuizAttempts.filter((a) => a.passed).length;
      const avgScore =
        totalAttempts > 0
          ? Math.round(
              courseQuizAttempts.reduce((sum, a) => sum + a.score, 0) /
                totalAttempts
            )
          : 0;

      return {
        courseId,
        courseTitle: enrollment.courseId.title,
        enrolledAt: enrollment.enrolledAt,
        progress: {
          completed,
          total: lectureCount,
          percentage:
            lectureCount > 0 ? Math.round((completed / lectureCount) * 100) : 0,
        },
        quizzes: {
          totalAttempts: totalAttempts,
          passed,
          averageScore: avgScore,
        },
      };
    });

    // Calculate overall quiz stats
    const totalQuizAttempts = quizAttempts.length;
    const passedQuizzes = (quizAttempts as unknown as QuizAttemptWithCourse[]).filter(
      (a) => a.passed
    ).length;
    const averageScore =
      totalQuizAttempts > 0
        ? Math.round(
            (quizAttempts as unknown as QuizAttemptWithCourse[]).reduce(
              (sum, a) => sum + a.score,
              0
            ) / totalQuizAttempts
          )
        : 0;

    return {
      success: true,
      data: {
        studentId: student._id.toString(),
        studentName: student.name,
        studentEmail: student.email,
        studentAvatar: student.profilePicture,
        totalEnrollments: enrollments.length,
        overallProgress: {
          completed: totalCompleted,
          total: totalLectures,
          percentage:
            totalLectures > 0
              ? Math.round((totalCompleted / totalLectures) * 100)
              : 0,
        },
        overallQuizzes: {
          totalAttempts: totalQuizAttempts,
          passed: passedQuizzes,
          failed: totalQuizAttempts - passedQuizzes,
          averageScore,
        },
        courses: courseProgress,
      },
    };
  } catch (error) {
    console.error("Error fetching student progress across courses:", error);
    return {
      success: false,
      error: "Failed to fetch student progress",
    };
  }
}

export interface StudentCourseProgress {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: Date;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  quizzes: {
    totalAttempts: number;
    passed: number;
    failed: number;
    averageScore: number;
  };
  lectures: Array<{
    _id: string;
    title: string;
    order: number;
    isCompleted: boolean;
    hasQuiz: boolean;
    quizAttempts?: Array<{
      attemptedAt: Date;
      score: number;
      passed: boolean;
    }>;
  }>;
  recentQuizAttempts: Array<{
    _id: string;
    lectureTitle: string;
    score: number;
    passed: boolean;
    attemptedAt: Date;
  }>;
}

// Get all enrolled students for a specific course
export async function getEnrolledStudentsForCourse(
  courseId: string,
  instructorId: string
): Promise<ActionResponse<EnrolledStudent[]>> {
  try {
    await dbConnect();

    // Verify instructor owns this course
    const Course = (await import("@/database/course.model")).default;
    const course = await Course.findOne({
      _id: courseId,
      instructorId: instructorId,
    }).lean();

    if (!course) {
      return {
        success: false,
        error: "Course not found or you don't have permission",
      };
    }

    // Get total lecture count for this course
    const totalLectures = await Lecture.countDocuments({ courseId });

    // Get all enrollments for this course with student data
    const enrollments = await Enrollment.find({ courseId })
      .populate("studentId", "name email profilePicture")
      .sort({ enrolledAt: -1 })
      .lean();

    if (enrollments.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Get quiz attempts for all students in this course
    const studentIds = enrollments.map((e) => e.studentId._id);
    const quizAttempts = await QuizAttempt.find({
      courseId,
      studentId: { $in: studentIds },
    })
      .select("studentId score passed")
      .lean();

    // Define types for populated enrollment
    interface PopulatedEnrollment {
      _id: Types.ObjectId;
      studentId: {
        _id: Types.ObjectId;
        name: string;
        email: string;
        profilePicture?: string;
      };
      progress: {
        completedLectures: Types.ObjectId[];
      };
      enrolledAt: Date;
    }

    interface QuizAttemptData {
      studentId: Types.ObjectId;
      score: number;
      passed: boolean;
    }

    // Build student stats
    const studentsWithStats: EnrolledStudent[] = (
      enrollments as unknown as PopulatedEnrollment[]
    ).map((enrollment) => {
      const studentId = enrollment.studentId._id.toString();

      // Get this student's quiz attempts
      const studentQuizAttempts = (quizAttempts as unknown as QuizAttemptData[]).filter(
        (attempt) => attempt.studentId.toString() === studentId
      );

      // Calculate quiz stats
      const totalQuizAttempts = studentQuizAttempts.length;
      const passedQuizzes = studentQuizAttempts.filter(
        (a) => a.passed
      ).length;
      const averageScore =
        totalQuizAttempts > 0
          ? Math.round(
              studentQuizAttempts.reduce((sum: number, a) => sum + a.score, 0) /
                totalQuizAttempts
            )
          : 0;

        // Calculate progress
        const completedLectures = enrollment.progress.completedLectures.length;
        const progressPercentage =
          totalLectures > 0
            ? Math.round((completedLectures / totalLectures) * 100)
            : 0;

        return {
          _id: studentId,
          name: enrollment.studentId.name,
          email: enrollment.studentId.email,
          profilePicture: enrollment.studentId.profilePicture,
          enrolledAt: enrollment.enrolledAt,
          progress: {
            completed: completedLectures,
            total: totalLectures,
            percentage: progressPercentage,
          },
          quizzes: {
            passed: passedQuizzes,
            total: totalQuizAttempts,
            averageScore,
          },
        };
      }
    );

    return {
      success: true,
      data: studentsWithStats,
    };
  } catch (error) {
    console.error("Error fetching enrolled students:", error);
    return {
      success: false,
      error: "Failed to fetch enrolled students",
    };
  }
}

// Get detailed progress for a specific student in a specific course
export async function getStudentCourseProgress(
  courseId: string,
  studentId: string,
  instructorId: string
): Promise<ActionResponse<StudentCourseProgress>> {
  try {
    await dbConnect();

    // Verify instructor owns this course
    const Course = (await import("@/database/course.model")).default;
    const course = await Course.findOne({
      _id: courseId,
      instructorId: instructorId,
    })
      .select("title")
      .lean();

    if (!course) {
      return {
        success: false,
        error: "Course not found or you don't have permission",
      };
    }

    // Get student info
    const student = await User.findById(studentId)
      .select("name email profilePicture")
      .lean();

    if (!student) {
      return {
        success: false,
        error: "Student not found",
      };
    }

    // Get enrollment
    const enrollment = await Enrollment.findOne({
      courseId,
      studentId,
    }).lean();

    if (!enrollment) {
      return {
        success: false,
        error: "Student is not enrolled in this course",
      };
    }

    // Get all lectures for this course
    const lectures = await Lecture.find({ courseId })
      .select("_id title order")
      .sort({ order: 1 })
      .lean();

    // Get all quiz attempts for this student in this course
    const quizAttempts = await QuizAttempt.find({
      courseId,
      studentId,
    })
      .populate("lectureId", "title")
      .sort({ attemptedAt: -1 })
      .lean();

    // Get Quiz model to check which lectures have quizzes
    const Quiz = (await import("@/database/quiz.model")).default;
    const quizzes = await Quiz.find({
      lectureId: { $in: lectures.map((l) => l._id) },
    })
      .select("lectureId")
      .lean();

    interface QuizData {
      lectureId: Types.ObjectId;
    }

    interface LectureData {
      _id: Types.ObjectId;
      title: string;
      order: number;
    }

    interface PopulatedQuizAttempt {
      _id: Types.ObjectId;
      lectureId: {
        _id: Types.ObjectId;
        title: string;
      };
      score: number;
      passed: boolean;
      attemptedAt: Date;
    }

    const lectureIdsWithQuizzes = new Set(
      (quizzes as unknown as QuizData[]).map((q) => q.lectureId.toString())
    );

    // Build lecture list with completion and quiz info
    const completedLectureIds = new Set(
      enrollment.progress.completedLectures.map((id: Types.ObjectId) =>
        id.toString()
      )
    );

    const lecturesWithProgress = (lectures as unknown as LectureData[]).map((lecture) => {
      const lectureId = lecture._id.toString();
      const hasQuiz = lectureIdsWithQuizzes.has(lectureId);
      const lectureQuizAttempts = (quizAttempts as unknown as PopulatedQuizAttempt[])
        .filter((attempt) => attempt.lectureId._id.toString() === lectureId)
        .map((attempt) => ({
          attemptedAt: attempt.attemptedAt,
          score: attempt.score,
          passed: attempt.passed,
        }));

      return {
        _id: lectureId,
        title: lecture.title,
        order: lecture.order,
        isCompleted: completedLectureIds.has(lectureId),
        hasQuiz,
        quizAttempts: lectureQuizAttempts.length > 0 ? lectureQuizAttempts : undefined,
      };
    });

    // Calculate quiz stats
    const totalQuizAttempts = quizAttempts.length;
    const passedQuizzes = (quizAttempts as unknown as PopulatedQuizAttempt[]).filter((a) => a.passed).length;
    const failedQuizzes = totalQuizAttempts - passedQuizzes;
    const averageScore =
      totalQuizAttempts > 0
        ? Math.round(
            (quizAttempts as unknown as PopulatedQuizAttempt[]).reduce((sum, a) => sum + a.score, 0) /
              totalQuizAttempts
          )
        : 0;

    // Get recent quiz attempts (last 5)
    const recentQuizAttempts = (quizAttempts as unknown as PopulatedQuizAttempt[]).slice(0, 5).map((attempt) => ({
      _id: attempt._id.toString(),
      lectureTitle: attempt.lectureId.title,
      score: attempt.score,
      passed: attempt.passed,
      attemptedAt: attempt.attemptedAt,
    }));

    // Calculate progress
    const completedLectures = enrollment.progress.completedLectures.length;
    const totalLectures = lectures.length;
    const progressPercentage =
      totalLectures > 0
        ? Math.round((completedLectures / totalLectures) * 100)
        : 0;

    const studentProgress: StudentCourseProgress = {
      studentId: student._id.toString(),
      studentName: student.name,
      studentEmail: student.email,
      studentAvatar: student.profilePicture,
      courseId: courseId,
      courseTitle: course.title,
      enrolledAt: enrollment.enrolledAt,
      progress: {
        completed: completedLectures,
        total: totalLectures,
        percentage: progressPercentage,
      },
      quizzes: {
        totalAttempts: totalQuizAttempts,
        passed: passedQuizzes,
        failed: failedQuizzes,
        averageScore,
      },
      lectures: lecturesWithProgress,
      recentQuizAttempts,
    };

    return {
      success: true,
      data: studentProgress,
    };
  } catch (error) {
    console.error("Error fetching student course progress:", error);
    return {
      success: false,
      error: "Failed to fetch student progress",
    };
  }
}
