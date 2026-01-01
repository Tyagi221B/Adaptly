import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { getMyCourses } from "@/actions/course.actions";
import { getInstructorStudentCount } from "@/actions/instructor.actions";

export async function InstructorStats() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const [coursesResult, studentCountResult] = await Promise.all([
    getMyCourses(session.user.id),
    getInstructorStudentCount(session.user.id),
  ]);

  const courses = coursesResult.success ? coursesResult.data : [];
  const totalStudents = studentCountResult.success ? studentCountResult.data : 0;

  if (!courses || courses.length === 0) {
    return null;
  }

  const totalCourses = courses.length;
  const totalLectures = courses.reduce((acc, course) => acc + course.lectureCount, 0);
  const publishedCourses = courses.filter((course) => course.isPublished).length;

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Total Courses
        </h3>
        <p className="text-3xl font-bold text-foreground">{totalCourses}</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Total Lectures
        </h3>
        <p className="text-3xl font-bold text-foreground">{totalLectures}</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Published Courses
        </h3>
        <p className="text-3xl font-bold text-foreground">{publishedCourses}</p>
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
  );
}
