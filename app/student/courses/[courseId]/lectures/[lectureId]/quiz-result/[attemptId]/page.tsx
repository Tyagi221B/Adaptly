import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getQuizAttemptById } from "@/actions/quiz-attempt.actions";
import { markLectureComplete } from "@/actions/enrollment.actions";
import { generateRemedialContent } from "@/lib/ai";
import type { WrongAnswer } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function QuizResultPage({
  params,
}: {
  params: Promise<{
    courseId: string;
    lectureId: string;
    attemptId: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId, lectureId, attemptId } = await params;

  // Fetch quiz attempt details
  const attemptResult = await getQuizAttemptById(attemptId, session.user.id);

  if (!attemptResult.success || !attemptResult.data) {
    redirect(`/student/courses/${courseId}/lectures/${lectureId}`);
  }

  const attempt = attemptResult.data;

  // Mark lecture as complete if passed
  if (attempt.passed) {
    await markLectureComplete(session.user.id, courseId, lectureId);
  }

  // Prepare wrong answers for AI
  const wrongAnswers: WrongAnswer[] = attempt.answers
    .filter((answer) => !answer.isCorrect)
    .map((answer) => {
      const question = attempt.quiz.questions[answer.questionIndex];
      return {
        questionText: question.questionText,
        correctAnswer: question.options[question.correctAnswerIndex],
        studentAnswer: question.options[answer.selectedAnswerIndex],
        explanation: question.explanation,
      };
    });

  // Generate AI remedial content
  let remedialContent = "";
  if (wrongAnswers.length > 0) {
    try {
      remedialContent = await generateRemedialContent(
        attempt.lecture.content,
        wrongAnswers
      );
    } catch (error) {
      console.error("Failed to generate remedial content:", error);
      remedialContent =
        "Unable to generate personalized feedback at this time. Please review the questions you got wrong and try again.";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/student/courses/${courseId}/lectures/${lectureId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Lecture
          </Link>
        </Button>

        {/* Score Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
            <CardDescription>{attempt.lecture.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Score Display */}
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-6">
                <div>
                  <p className="mb-1 text-sm text-gray-600">Your Score</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {attempt.score}%
                  </p>
                </div>
                <div className="text-right">
                  {attempt.passed ? (
                    <Badge className="mb-2 bg-green-600 text-lg">
                      Passed ✓
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="mb-2 text-lg">
                      Not Passed
                    </Badge>
                  )}
                  <p className="text-sm text-gray-600">
                    Passing score: {attempt.quiz.passingScore}%
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {attempt.quiz.questions.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Questions</p>
                </div>
                <div className="rounded-lg border bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {attempt.answers.filter((a) => a.isCorrect).length}
                  </p>
                  <p className="text-sm text-gray-600">Correct</p>
                </div>
                <div className="rounded-lg border bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {attempt.answers.filter((a) => !a.isCorrect).length}
                  </p>
                  <p className="text-sm text-gray-600">Incorrect</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Remedial Content */}
        {wrongAnswers.length > 0 && remedialContent && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                Personalized Learning Guide
              </CardTitle>
              <CardDescription>
                Based on your answers, here's what we recommend focusing on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {remedialContent}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Review */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>
              Review your answers for each question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {attempt.quiz.questions.map((question, index) => {
              const studentAnswer = attempt.answers.find(
                (a) => a.questionIndex === index
              );
              const isCorrect = studentAnswer?.isCorrect || false;

              return (
                <div
                  key={index}
                  className={`rounded-lg border p-6 ${
                    isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  {/* Question Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="mt-1 h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="mt-1 h-6 w-6 text-red-600" />
                      )}
                      <div>
                        <p className="text-sm text-gray-600">
                          Question {index + 1}
                        </p>
                        <h3 className="text-lg font-medium text-gray-900">
                          {question.questionText}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="ml-9 space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isStudentAnswer =
                        studentAnswer?.selectedAnswerIndex === optIndex;
                      const isCorrectAnswer =
                        question.correctAnswerIndex === optIndex;

                      return (
                        <div
                          key={optIndex}
                          className={`rounded border p-3 ${
                            isCorrectAnswer
                              ? "border-green-300 bg-green-100"
                              : isStudentAnswer
                              ? "border-red-300 bg-red-100"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900">{option}</span>
                            {isCorrectAnswer && (
                              <Badge className="bg-green-600">Correct</Badge>
                            )}
                            {isStudentAnswer && !isCorrectAnswer && (
                              <Badge variant="destructive">Your Answer</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="ml-9 mt-4 rounded-lg bg-white p-4">
                      <p className="mb-1 text-sm font-medium text-gray-700">
                        Explanation:
                      </p>
                      <p className="text-sm text-gray-600">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/student/courses/${courseId}`}>Back to Course</Link>
          </Button>
          {!attempt.passed && (
            <Button asChild className="flex-1">
              <Link href={`/student/courses/${courseId}/lectures/${lectureId}`}>
                Retake Quiz
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
