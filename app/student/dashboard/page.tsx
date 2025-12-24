import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { getMyEnrollments } from "@/actions/enrollment.actions";
import { getAvailableCoursesForStudent } from "@/actions/course.actions";
import { DashboardClient } from "./dashboard-client";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch enrollments and available courses in parallel
  const [enrollmentsResult, availableCoursesResult] = await Promise.all([
    getMyEnrollments(session.user.id),
    getAvailableCoursesForStudent(session.user.id),
  ]);

  const enrollments = enrollmentsResult.success ? enrollmentsResult.data || [] : [];
  const availableCourses = availableCoursesResult.success ? availableCoursesResult.data || [] : [];

  return (
    <DashboardClient
      userName={session.user.name || "Student"}
      userId={session.user.id}
      enrollments={enrollments}
      availableCourses={availableCourses}
    />
  );
}
