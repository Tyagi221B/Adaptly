import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { getPublishedCourses } from "@/actions/course.actions";
import { getMyEnrollments } from "@/actions/enrollment.actions";
import { DiscoverClient } from "./discover-client";

export default async function StudentDiscoverPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "student") {
    redirect("/login");
  }

  // Fetch all published courses and enrollments in parallel
  const [coursesResult, enrollmentsResult] = await Promise.all([
    getPublishedCourses(),
    getMyEnrollments(session.user.id),
  ]);

  const allCourses = coursesResult.success && coursesResult.data ? coursesResult.data : [];
  const enrollments = enrollmentsResult.success && enrollmentsResult.data ? enrollmentsResult.data : [];

  // Get enrolled course IDs
  const enrolledCourseIds = new Set(
    enrollments.map((e) => e.courseId.toString())
  );

  return (
    <DiscoverClient
      userId={session.user.id}
      allCourses={allCourses || []}
      enrolledCourseIds={enrolledCourseIds}
    />
  );
}
