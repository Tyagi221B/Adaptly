import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { getLectureForStudent } from "@/actions/lecture.actions";
import { getQuizForStudent } from "@/actions/quiz.actions";
import { isEnrolled } from "@/actions/enrollment.actions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QuizTaker from "@/components/student/quiz-taker";

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

  // Check enrollment
  const enrollmentResult = await isEnrolled(session.user.id, courseId);

  if (!enrollmentResult.success || !enrollmentResult.data?.enrolled) {
    redirect(`/student/courses/${courseId}`);
  }

  // Fetch lecture
  const lectureResult = await getLectureForStudent(lectureId);

  if (!lectureResult.success || !lectureResult.data) {
    redirect(`/student/courses/${courseId}`);
  }

  const lecture = lectureResult.data;

  // Fetch quiz
  const quizResult = await getQuizForStudent(lectureId);

  if (!quizResult.success || !quizResult.data) {
    // No quiz for this lecture - redirect back to lecture
    redirect(`/student/courses/${courseId}/lectures/${lectureId}`);
  }

  const quiz = quizResult.data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-8 px-4">
        {/* Quiz Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Quiz Time
            </div>
            <CardTitle className="text-2xl">{lecture.title} - Quiz</CardTitle>
            <CardDescription>
              Answer all questions to test your understanding. Passing score: {quiz.passingScore}%
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Quiz Content */}
        <QuizTaker
          quiz={quiz}
          lectureId={lectureId}
          courseId={courseId}
          studentId={session.user.id}
        />
      </div>
    </div>
  );
}
