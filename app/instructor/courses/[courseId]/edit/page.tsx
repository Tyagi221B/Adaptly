import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getCourseById } from "@/actions/course.actions";
import { Button } from "@/components/ui/button";
import CourseForm from "@/components/instructor/course-form";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId } = await params;

  // Fetch course details
  const result = await getCourseById(courseId, session.user.id);

  if (!result.success || !result.data) {
    redirect("/instructor/dashboard");
  }

  const { course } = result.data;

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

        {/* Course Form */}
        <CourseForm
          instructorId={session.user.id}
          courseId={courseId}
          initialData={{
            title: course.title,
            description: course.description,
            category: course.category,
            thumbnail: course.thumbnail || "",
            instructorMessage: course.instructorMessage || "",
          }}
        />
      </div>
    </div>
  );
}
