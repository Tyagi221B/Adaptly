import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import LectureForm from "@/components/instructor/lecture-form";
import { Button } from "@/components/ui/button";
import { getNextLectureOrder } from "@/actions/lecture.actions";

export default async function NewLecturePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId } = await params;

  // Get the next order number for this course
  const orderResult = await getNextLectureOrder(courseId);
  const nextOrder = orderResult.success ? orderResult.data?.nextOrder || 1 : 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/instructor/courses/${courseId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
        </Button>

        {/* Form */}
        <LectureForm
          courseId={courseId}
          instructorId={session.user.id}
          nextOrder={nextOrder}
        />
      </div>
    </div>
  );
}
