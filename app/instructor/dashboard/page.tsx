import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import CourseCard from "@/components/instructor/course-card";
import { Button } from "@/components/ui/button";
import { getMyCourses } from "@/actions/course.actions";

export default async function InstructorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch instructor's courses
  const coursesResult = await getMyCourses(session.user.id);
  const courses = coursesResult.success ? coursesResult.data : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {session.user.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your courses and track student progress
            </p>
          </div>

          <Button asChild size="lg">
            <Link href="/instructor/courses/new">
              <Plus className="mr-2 h-5 w-5" />
              Create Course
            </Link>
          </Button>
        </div>

        {/* Courses Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            My Courses
          </h2>

          {courses && courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-white p-12 text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No courses yet
              </h3>
              <p className="mb-4 text-gray-600">
                Get started by creating your first course
              </p>
              <Button asChild>
                <Link href="/instructor/courses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Course
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {courses && courses.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-medium text-gray-600">
                Total Courses
              </h3>
              <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-medium text-gray-600">
                Total Lectures
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {courses.reduce((acc, course) => acc + course.lectureCount, 0)}
              </p>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-medium text-gray-600">
                Published Courses
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {courses.filter((course) => course.isPublished).length}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
