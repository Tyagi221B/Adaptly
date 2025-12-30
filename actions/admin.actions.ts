"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/database/user.model";
import Course from "@/database/course.model";
import Enrollment from "@/database/enrollment.model";
import QuizAttempt from "@/database/quiz-attempt.model";
import CourseReview from "@/database/course-review.model";
import Lecture from "@/database/lecture.model";
import Quiz from "@/database/quiz.model";
import type {
  StudentListItem,
  StudentDetails,
  InstructorListItem,
  InstructorDetails,
  PlatformStats,
  TrendingCourse,
} from "@/types/admin";
import type { IUser } from "@/database/user.model";
import type { ICourse } from "@/database/course.model";
import type { ILecture } from "@/database/lecture.model";
import type { IQuizAttempt } from "@/database/quiz-attempt.model";

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// PLATFORM STATS
// ============================================

export async function getPlatformStats(): Promise<
  ActionResponse<PlatformStats>
> {
  try {
    await dbConnect();

    const [
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalQuizAttempts,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "instructor" }),
      Course.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Enrollment.countDocuments(),
      QuizAttempt.countDocuments(),
      CourseReview.countDocuments(),
    ]);

    // Calculate average platform rating
    const ratingAgg = await CourseReview.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const averagePlatformRating =
      ratingAgg.length > 0 ? Math.round(ratingAgg[0].avgRating * 10) / 10 : 0;

    return {
      success: true,
      data: {
        totalStudents,
        totalInstructors,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalQuizAttempts,
        averagePlatformRating,
        totalReviews,
      },
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return { success: false, error: "Failed to fetch platform statistics" };
  }
}

// ============================================
// STUDENTS
// ============================================

export async function getAllStudents(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<StudentListItem[]>> {
  try {
    await dbConnect();

    const { search, limit = 50, offset = 0 } = params || {};

    // Build search filter
    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get students with basic info
    const students = await User.find({
      role: "student",
      ...searchFilter,
    })
      .select("name email profilePicture createdAt")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Calculate stats for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const [enrollments, quizAttempts] = await Promise.all([
          Enrollment.find({ studentId: student._id }).lean(),
          QuizAttempt.find({ studentId: student._id }).lean(),
        ]);

        const passedQuizzes = quizAttempts.filter((q) => q.passed);
        const averageScore =
          quizAttempts.length > 0
            ? Math.round(
                quizAttempts.reduce((sum, q) => sum + q.score, 0) /
                  quizAttempts.length
              )
            : 0;

        return {
          _id: student._id.toString(),
          name: student.name,
          email: student.email,
          profilePicture: student.profilePicture || undefined,
          enrollmentCount: enrollments.length,
          quizzesPassedCount: passedQuizzes.length,
          averageScore,
          createdAt: student.createdAt,
        };
      })
    );

    return { success: true, data: studentsWithStats };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { success: false, error: "Failed to fetch students" };
  }
}

export async function getStudentDetails(
  studentId: string
): Promise<ActionResponse<StudentDetails>> {
  try {
    await dbConnect();

    const student = await User.findById(studentId).lean();

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    if (student.role !== "student") {
      return { success: false, error: "User is not a student" };
    }

    // Get enrollments with course details
    const enrollments = await Enrollment.find({ studentId: student._id })
      .populate("courseId")
      .lean();

    // Get quiz attempts
    const quizAttempts = await QuizAttempt.find({ studentId: student._id })
      .populate("lectureId")
      .populate("courseId")
      .lean();

    // Get reviews
    const reviews = await CourseReview.find({ studentId: student._id })
      .populate("courseId")
      .lean();

    // Process enrollments
    const enrollmentDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.courseId as unknown as ICourse;
        const courseId = course._id.toString();

        const totalLectures = await Lecture.countDocuments({ courseId });
        const completedLectures = enrollment.progress.completedLectures.length;
        const courseQuizzes = quizAttempts.filter(
          (q) => (q.courseId as unknown as ICourse)._id.toString() === courseId
        );
        const passedQuizzes = courseQuizzes.filter((q) => q.passed);
        const avgScore =
          courseQuizzes.length > 0
            ? Math.round(
                courseQuizzes.reduce((sum, q) => sum + q.score, 0) /
                  courseQuizzes.length
              )
            : 0;

        // Get instructor name
        const courseDoc = await Course.findById(courseId)
          .populate("instructorId")
          .lean();
        const instructor = courseDoc?.instructorId as unknown as IUser;

        return {
          courseId,
          courseTitle: course.title,
          courseThumbnail: course.thumbnail,
          instructorName: instructor?.name || "Unknown",
          enrolledAt: enrollment.enrolledAt,
          completedLectures,
          totalLectures,
          progressPercentage:
            totalLectures > 0
              ? Math.round((completedLectures / totalLectures) * 100)
              : 0,
          quizzesTaken: courseQuizzes.length,
          quizzesPassed: passedQuizzes.length,
          averageQuizScore: avgScore,
        };
      })
    );

    // Quiz statistics
    const passedQuizzes = quizAttempts.filter((q) => q.passed);
    const avgScore =
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((sum, q) => sum + q.score, 0) /
              quizAttempts.length
          )
        : 0;

    // Recent attempts
    const recentAttempts = quizAttempts
      .sort((a, b) => b.attemptedAt.getTime() - a.attemptedAt.getTime())
      .slice(0, 10)
      .map((attempt) => {
        const lecture = attempt.lectureId as unknown as ILecture;
        const course = attempt.courseId as unknown as ICourse;
        return {
          attemptId: attempt._id.toString(),
          lectureTitle: lecture?.title || "Unknown Lecture",
          courseTitle: course?.title || "Unknown Course",
          score: attempt.score,
          passed: attempt.passed,
          attemptedAt: attempt.attemptedAt,
        };
      });

    // Group attempts by course
    const attemptsByCourseMap = new Map<
      string,
      { courseId: string; courseTitle: string; attempts: IQuizAttempt[] }
    >();

    quizAttempts.forEach((attempt) => {
      const course = attempt.courseId as unknown as ICourse;
      const courseId = course._id.toString();
      if (!attemptsByCourseMap.has(courseId)) {
        attemptsByCourseMap.set(courseId, {
          courseId,
          courseTitle: course.title,
          attempts: [],
        });
      }
      attemptsByCourseMap.get(courseId)!.attempts.push(attempt);
    });

    const attemptsByCourse = Array.from(attemptsByCourseMap.values()).map(
      (item) => {
        const passed = item.attempts.filter((a) => a.passed).length;
        const avgScore =
          item.attempts.length > 0
            ? Math.round(
                item.attempts.reduce((sum: number, a: IQuizAttempt) => sum + a.score, 0) /
                  item.attempts.length
              )
            : 0;
        return {
          courseId: item.courseId,
          courseTitle: item.courseTitle,
          attempts: item.attempts.length,
          passed,
          averageScore: avgScore,
        };
      }
    );

    // Process reviews
    const reviewDetails = reviews.map((review) => {
      const course = review.courseId as unknown as ICourse;
      return {
        _id: review._id.toString(),
        courseId: course._id.toString(),
        courseTitle: course.title,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      };
    });

    const studentDetails: StudentDetails = {
      _id: student._id.toString(),
      name: student.name,
      email: student.email,
      profilePicture: student.profilePicture || undefined,
      bio: student.bio || undefined,
      linkedIn: student.linkedIn || undefined,
      github: student.github || undefined,
      enrollmentCount: enrollments.length,
      quizzesPassedCount: passedQuizzes.length,
      averageScore: avgScore,
      createdAt: student.createdAt,
      enrollments: enrollmentDetails,
      quizStats: {
        totalAttempts: quizAttempts.length,
        totalPassed: passedQuizzes.length,
        totalFailed: quizAttempts.length - passedQuizzes.length,
        passRate:
          quizAttempts.length > 0
            ? Math.round((passedQuizzes.length / quizAttempts.length) * 100)
            : 0,
        averageScore: avgScore,
        attemptsByCourse,
        recentAttempts,
      },
      reviews: reviewDetails,
    };

    return { success: true, data: studentDetails };
  } catch (error) {
    console.error("Error fetching student details:", error);
    return { success: false, error: "Failed to fetch student details" };
  }
}

// ============================================
// INSTRUCTORS
// ============================================

export async function getAllInstructors(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<InstructorListItem[]>> {
  try {
    await dbConnect();

    const { search, limit = 50, offset = 0 } = params || {};

    // Build search filter
    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get instructors
    const instructors = await User.find({
      role: "instructor",
      ...searchFilter,
    })
      .select("name email profilePicture createdAt")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Calculate stats for each instructor
    const instructorsWithStats = await Promise.all(
      instructors.map(async (instructor) => {
        const courses = await Course.find({ instructorId: instructor._id }).lean();
        const publishedCourses = courses.filter((c) => c.isPublished);

        // Calculate total students
        const courseIds = courses.map((c) => c._id);
        const totalStudents = await Enrollment.countDocuments({
          courseId: { $in: courseIds },
        });

        // Calculate average rating
        const avgRating =
          courses.length > 0
            ? Math.round(
                (courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) /
                  courses.length) *
                  10
              ) / 10
            : 0;

        return {
          _id: instructor._id.toString(),
          name: instructor.name,
          email: instructor.email,
          profilePicture: instructor.profilePicture || undefined,
          totalCourses: courses.length,
          publishedCourses: publishedCourses.length,
          totalStudents,
          averageRating: avgRating,
          createdAt: instructor.createdAt,
        };
      })
    );

    return { success: true, data: instructorsWithStats };
  } catch (error) {
    console.error("Error fetching instructors:", error);
    return { success: false, error: "Failed to fetch instructors" };
  }
}

export async function getInstructorDetails(
  instructorId: string
): Promise<ActionResponse<InstructorDetails>> {
  try {
    await dbConnect();

    const instructor = await User.findById(instructorId).lean();

    if (!instructor) {
      return { success: false, error: "Instructor not found" };
    }

    if (instructor.role !== "instructor") {
      return { success: false, error: "User is not an instructor" };
    }

    // Get all courses
    const courses = await Course.find({ instructorId: instructor._id }).lean();

    // Process each course
    const courseDetails = await Promise.all(
      courses.map(async (course) => {
        const courseId = course._id.toString();

        const [totalLectures, totalQuizzes, enrolledStudents] = await Promise.all([
          Lecture.countDocuments({ courseId }),
          Quiz.countDocuments({
            lectureId: {
              $in: await Lecture.find({ courseId }).distinct("_id"),
            },
          }),
          Enrollment.countDocuments({ courseId }),
        ]);

        return {
          _id: courseId,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail || undefined,
          category: course.category,
          isPublished: course.isPublished,
          enrolledStudents,
          totalLectures,
          totalQuizzes,
          averageRating: course.averageRating || 0,
          totalReviews: course.totalReviews || 0,
          createdAt: course.createdAt,
        };
      })
    );

    const publishedCourses = courseDetails.filter((c) => c.isPublished);
    const totalStudents = courseDetails.reduce(
      (sum, c) => sum + c.enrolledStudents,
      0
    );
    const avgRating =
      courseDetails.length > 0
        ? Math.round(
            (courseDetails.reduce((sum, c) => sum + c.averageRating, 0) /
              courseDetails.length) *
              10
          ) / 10
        : 0;

    const instructorDetails: InstructorDetails = {
      _id: instructor._id.toString(),
      name: instructor.name,
      email: instructor.email,
      profilePicture: instructor.profilePicture || undefined,
      bio: instructor.bio || undefined,
      linkedIn: instructor.linkedIn || undefined,
      github: instructor.github || undefined,
      totalCourses: courses.length,
      publishedCourses: publishedCourses.length,
      totalStudents,
      averageRating: avgRating,
      createdAt: instructor.createdAt,
      courses: courseDetails,
    };

    return { success: true, data: instructorDetails };
  } catch (error) {
    console.error("Error fetching instructor details:", error);
    return { success: false, error: "Failed to fetch instructor details" };
  }
}

// ============================================
// TRENDING COURSES
// ============================================

export async function getTrendingCourses(
  limit: number = 5
): Promise<ActionResponse<TrendingCourse[]>> {
  try {
    await dbConnect();

    const courses = await Course.find({ isPublished: true })
      .populate("instructorId", "name")
      .sort({ averageRating: -1 })
      .limit(limit)
      .lean();

    const trending = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await Enrollment.countDocuments({
          courseId: course._id,
        });
        const instructor = course.instructorId as unknown as IUser;

        return {
          _id: course._id.toString(),
          title: course.title,
          instructorName: instructor?.name || "Unknown",
          enrollments,
          averageRating: course.averageRating || 0,
          totalReviews: course.totalReviews || 0,
          thumbnail: course.thumbnail || undefined,
          category: course.category,
        };
      })
    );

    // Sort by enrollments
    trending.sort((a, b) => b.enrollments - a.enrollments);

    return { success: true, data: trending };
  } catch (error) {
    console.error("Error fetching trending courses:", error);
    return { success: false, error: "Failed to fetch trending courses" };
  }
}
