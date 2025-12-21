import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getLectureById } from "@/actions/lecture.actions";
import { Button } from "@/components/ui/button";
import LectureForm from "@/components/instructor/lecture-form";

export default async function EditLecturePage({
  params,
}: {
  params: Promise<{ courseId: string; lectureId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId, lectureId } = await params;

  // Fetch lecture details
  const result = await getLectureById(lectureId, session.user.id);

  if (!result.success || !result.data) {
    redirect(`/instructor/courses/${courseId}`);
  }

  const lecture = result.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/instructor/courses/${courseId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
        </Button>

        {/* Lecture Form */}
        <LectureForm
          courseId={courseId}
          instructorId={session.user.id}
          lectureId={lectureId}
          initialData={{
            title: lecture.title,
            content: lecture.content,
            order: lecture.order,
          }}
        />
      </div>
    </div>
  );
}
