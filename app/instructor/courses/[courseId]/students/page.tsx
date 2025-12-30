import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getEnrolledStudentsForCourse } from "@/actions/instructor.actions";
import { getCourseById } from "@/actions/course.actions";
import { Button } from "@/components/ui/button";
import EnrolledStudentsTable from "@/components/instructor/enrolled-students-table";

export default async function CourseStudentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId } = await params;

  // Get course info
  const courseResult = await getCourseById(courseId, session.user.id);

  if (!courseResult.success || !courseResult.data) {
    redirect("/instructor/dashboard");
  }

  const { course } = courseResult.data;

  // Get enrolled students
  const studentsResult = await getEnrolledStudentsForCourse(
    courseId,
    session.user.id
  );

  const students = studentsResult.success && studentsResult.data ? studentsResult.data : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/instructor/courses/${courseId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Enrolled Students
          </h1>
          <p className="text-muted-foreground">
            {course.title} • {students.length} student
            {students.length !== 1 ? "s" : ""} enrolled
          </p>
        </div>

        {/* Students Table */}
        <EnrolledStudentsTable students={students} courseId={courseId} />
      </div>
    </div>
  );
}
