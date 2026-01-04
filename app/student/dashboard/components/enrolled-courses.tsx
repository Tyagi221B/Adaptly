import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { getMyEnrollments } from "@/actions/enrollment.actions";
import { CourseCard } from "@/components/shared/course-card";

export async function EnrolledCourses() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const enrollmentsResult = await getMyEnrollments(session.user.id);
  const enrollments = enrollmentsResult.success ? enrollmentsResult.data || [] : [];

  if (enrollments.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment) => (
          <CourseCard
            key={enrollment._id}
            course={{
              _id: enrollment.courseId,
              title: enrollment.courseTitle,
              description: enrollment.courseDescription,
              category: enrollment.courseCategory,
              thumbnail: enrollment.courseThumbnail,
              instructorName: enrollment.courseInstructorName,
              lectureCount: enrollment.totalLectures,
              averageRating: enrollment.courseAverageRating,
              totalReviews: enrollment.courseTotalReviews,
              enrolledStudentsCount: enrollment.courseEnrolledStudentsCount,
            }}
            variant="enrolled"
            enrollmentData={{
              progressPercentage: enrollment.progressPercentage,
              completedLectures: enrollment.completedLectures,
              totalLectures: enrollment.totalLectures,
            }}
          />
        ))}
      </div>
    </div>
  );
}
