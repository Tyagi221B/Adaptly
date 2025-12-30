import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import CourseCard from "@/components/instructor/course-card";
import { Button } from "@/components/ui/button";
import { getMyCourses } from "@/actions/course.actions";
import { getInstructorStudentCount } from "@/actions/instructor.actions";

export default async function InstructorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch instructor's courses and student count
  const [coursesResult, studentCountResult] = await Promise.all([
    getMyCourses(session.user.id),
    getInstructorStudentCount(session.user.id),
  ]);

  const courses = coursesResult.success ? coursesResult.data : [];
  const totalStudents = studentCountResult.success ? studentCountResult.data : 0;

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {session.user.name}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your courses and track student progress
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild size="lg" variant="outline" className="w-full md:w-auto">
            <Link href="/instructor/students">
              <Users className="mr-2 h-5 w-5" />
              View All Students
            </Link>
          </Button>
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link href="/instructor/courses/new">
              <Plus className="mr-2 h-5 w-5" />
              Create Course
            </Link>
          </Button>
        </div>
      </div>

        {/* Courses Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            My Courses
          </h2>

          {courses && courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-card p-12 text-center">
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                No courses yet
              </h3>
              <p className="mb-4 text-muted-foreground">
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
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Total Courses
              </h3>
              <p className="text-3xl font-bold text-foreground">{courses.length}</p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Total Lectures
              </h3>
              <p className="text-3xl font-bold text-foreground">
                {courses.reduce((acc, course) => acc + course.lectureCount, 0)}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Published Courses
              </h3>
              <p className="text-3xl font-bold text-foreground">
                {courses.filter((course) => course.isPublished).length}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Total Students
              </h3>
              <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Across all courses
              </p>
            </div>
          </div>
        )}
    </main>
  );
}
