import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { authOptions } from "@/lib/auth-config";
import { getLectureForStudent } from "@/actions/lecture.actions";
import { getQuizForStudent } from "@/actions/quiz.actions";
import { isEnrolled, markLectureComplete } from "@/actions/enrollment.actions";
import { getLatestQuizAttempt } from "@/actions/quiz-attempt.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QuizTaker from "@/components/student/quiz-taker";

export default async function LectureViewerPage({
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

  // Fetch quiz if exists
  const quizResult = await getQuizForStudent(lectureId);
  const quiz = quizResult.success && quizResult.data ? quizResult.data : null;

  // Get latest quiz attempt if quiz exists
  let latestAttempt = null;
  if (quiz) {
    const attemptResult = await getLatestQuizAttempt(
      session.user.id,
      quiz._id
    );
    if (attemptResult.success && attemptResult.data) {
      latestAttempt = attemptResult.data;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/student/courses/${courseId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
        </Button>

        {/* Lecture Content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="mb-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
              Lecture {lecture.order}
            </div>
            <CardTitle className="text-2xl">{lecture.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {lecture.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Section */}
        {quiz ? (
          <Card>
            <CardHeader>
              <CardTitle>Quiz</CardTitle>
              <CardDescription>
                Test your understanding of this lecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              {latestAttempt ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-gray-700">
                        Your latest attempt:
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          latestAttempt.passed
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {latestAttempt.score}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Status:{" "}
                      {latestAttempt.passed ? (
                        <span className="text-green-600">Passed ✓</span>
                      ) : (
                        <span className="text-red-600">
                          Not Passed (passing score: {quiz.passingScore}%)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button asChild variant="outline" className="flex-1">
                      <Link
                        href={`/student/courses/${courseId}/lectures/${lectureId}/quiz-result/${latestAttempt._id}`}
                      >
                        View Results
                      </Link>
                    </Button>
                    {!latestAttempt.passed && (
                      <QuizTaker
                        quiz={quiz}
                        lectureId={lectureId}
                        courseId={courseId}
                        studentId={session.user.id}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <QuizTaker
                  quiz={quiz}
                  lectureId={lectureId}
                  courseId={courseId}
                  studentId={session.user.id}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">
                No quiz available for this lecture
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
