import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getMyCourses } from "@/actions/course.actions";
import CourseCard from "@/components/instructor/course-card";
import { Button } from "@/components/ui/button";

export async function InstructorCourses() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const coursesResult = await getMyCourses(session.user.id);
  const courses = coursesResult.success ? coursesResult.data : [];

  return (
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
  );
}
