import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getAvailableCoursesForStudent } from "@/actions/course.actions";
import { getMyEnrollments } from "@/actions/enrollment.actions";
import { CourseCard } from "@/components/shared/course-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export async function AvailableCourses() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const [availableCoursesResult, enrollmentsResult] = await Promise.all([
    getAvailableCoursesForStudent(session.user.id),
    getMyEnrollments(session.user.id),
  ]);

  const availableCourses = availableCoursesResult.success ? availableCoursesResult.data || [] : [];
  const enrollments = enrollmentsResult.success ? enrollmentsResult.data || [] : [];

  // Show max 6 courses if user has enrollments (recommended section)
  const coursesToShow = enrollments.length > 0
    ? availableCourses.slice(0, 6)
    : availableCourses;

  if (availableCourses.length === 0 && enrollments.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses available"
        description="Check back later for new courses"
      />
    );
  }

  if (availableCourses.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">
          {enrollments.length > 0 ? "Recommended For You" : "Browse All Courses"}
        </h2>
        {enrollments.length > 0 && (
          <Button asChild variant="outline" size="sm">
            <Link href="/student/discover">
              Browse All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coursesToShow.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            variant="available"
            studentId={session.user.id}
          />
        ))}
      </div>
    </div>
  );
}
