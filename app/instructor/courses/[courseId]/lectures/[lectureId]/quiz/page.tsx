import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import QuizGenerator from "@/components/instructor/quiz-generator";
import { Button } from "@/components/ui/button";
import { getLectureById } from "@/actions/lecture.actions";
import { getQuizByLecture } from "@/actions/quiz.actions";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseId: string; lectureId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId, lectureId } = await params;

  // Fetch lecture
  const lectureResult = await getLectureById(lectureId, session.user.id);

  if (!lectureResult.success || !lectureResult.data) {
    redirect(`/instructor/courses/${courseId}`);
  }

  // Fetch existing quiz if any
  const quizResult = await getQuizByLecture(lectureId, session.user.id);
  const existingQuiz = quizResult.success && quizResult.data ? quizResult.data : null;

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

        {/* Lecture Info */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            {lectureResult.data.title}
          </h1>
          <p className="text-muted-foreground">Generate and manage quiz questions</p>
        </div>

        {/* Quiz Generator Component */}
        <QuizGenerator
          lectureId={lectureId}
          instructorId={session.user.id}
          existingQuiz={existingQuiz}
        />
      </div>
    </div>
  );
}
