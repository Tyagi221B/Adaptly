import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { authOptions } from "@/lib/auth-config";
import { getQuizAttemptById, generateRemedialContent } from "@/actions/quiz-attempt.actions";
import { markLectureComplete } from "@/actions/enrollment.actions";
import { getCourseLectures } from "@/actions/lecture.actions";
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
import { NextLectureButton } from "@/components/student/next-lecture-button";
import AIChatAssistant from "@/components/student/ai-chat-assistant";

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

  // Get all lectures to find the next one
  const lecturesResult = await getCourseLectures(courseId, session.user.id);
  const allLectures = lecturesResult.success && lecturesResult.data
    ? lecturesResult.data.sort((a, b) => a.order - b.order)
    : [];

  const currentLectureIndex = allLectures.findIndex(l => l._id === lectureId);
  const nextLecture = currentLectureIndex !== -1 && currentLectureIndex < allLectures.length - 1
    ? allLectures[currentLectureIndex + 1]
    : null;

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

  // Generate AI remedial content with rate limiting
  let remedialContent = "";
  if (wrongAnswers.length > 0) {
    const result = await generateRemedialContent(
      session.user.id,
      attempt.lecture.content,
      wrongAnswers
    );

    if (result.success && result.data) {
      remedialContent = result.data.content;
    } else {
      remedialContent = result.error ||
        "Unable to generate personalized feedback at this time. Please review the questions you got wrong and try again.";
    }
  }

  // Build enhanced context for AI chat
  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const totalQuestions = attempt.quiz.questions.length;

  const enhancedContext = `# LECTURE CONTENT

${attempt.lecture.content}

---

# QUIZ RESULTS SUMMARY

**Score:** ${attempt.score}% (${correctCount}/${totalQuestions} correct)
**Status:** ${attempt.passed ? 'PASSED ✓' : 'NOT PASSED'}
**Passing Score:** ${attempt.quiz.passingScore}%

---

# QUESTIONS YOU GOT WRONG

${wrongAnswers.length > 0
  ? wrongAnswers.map((q, i) => `
**Question ${i + 1}:** ${q.questionText}
- **Your Answer:** ${q.studentAnswer}
- **Correct Answer:** ${q.correctAnswer}
- **Explanation:** ${q.explanation || 'No explanation provided'}
`).join('\n')
  : 'Perfect score! You got all questions correct! 🎉'}

---

# AI REMEDIAL FEEDBACK ALREADY PROVIDED

${remedialContent || 'No additional feedback needed - great job!'}

---

You are helping the student understand their quiz performance. They may ask:
- Why certain answers were wrong
- Clarification on concepts they missed
- Additional examples or practice questions
- How to improve for next time`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl py-8 px-4">
        {/* Flex Container: Content + AI Sidebar */}
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Score Card */}
            <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
            <CardDescription>{attempt.lecture.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Score Display */}
              <div className="flex items-center justify-between rounded-lg bg-background p-6">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Your Score</p>
                  <p className="text-4xl font-bold text-foreground">
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
                  <p className="text-sm text-muted-foreground">
                    Passing score: {attempt.quiz.passingScore}%
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border bg-card p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {attempt.quiz.questions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {attempt.answers.filter((a) => a.isCorrect).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {attempt.answers.filter((a) => !a.isCorrect).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Remedial Content */}
        {wrongAnswers.length > 0 && remedialContent && (
          <Card className="mb-8 border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                Personalized Learning Guide
              </CardTitle>
              <CardDescription>
                Based on your answers, here&apos;s what we recommend focusing on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:text-foreground prose-code:rounded prose-code:px-1 prose-code:py-0.5">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {remedialContent}
                </ReactMarkdown>
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
                  className={`rounded-lg border p-6 bg-card ${
                    isCorrect ? "border-emerald-500" : "border-red-500"
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
                        <p className="text-sm text-muted-foreground">
                          Question {index + 1}
                        </p>
                        <h3 className="text-lg font-medium text-foreground">
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
                              ? "border-emerald-500 bg-emerald-500/10"
                              : isStudentAnswer
                              ? "border-destructive bg-destructive/10"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">{option}</span>
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
                    <div className="ml-9 mt-4 rounded-lg bg-card p-4">
                      <p className="mb-1 text-sm font-medium text-foreground">
                        Explanation:
                      </p>
                      <p className="text-sm text-muted-foreground">
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline" className="w-full sm:flex-1">
                <Link href={`/student/courses/${courseId}/lectures/${lectureId}`}>
                  Back to Lecture
                </Link>
              </Button>
              {!attempt.passed ? (
                <Button asChild className="w-full sm:flex-1">
                  <Link href={`/student/courses/${courseId}/lectures/${lectureId}/quiz`}>
                    Retake Quiz
                  </Link>
                </Button>
              ) : nextLecture ? (
                <NextLectureButton
                  courseId={courseId}
                  lectureId={nextLecture._id}
                  className="w-full sm:flex-1"
                />
              ) : null}
            </div>
          </div>

          {/* AI Sidebar - Desktop Only */}
          <div className="hidden lg:block w-96 shrink-0">
            <AIChatAssistant
              lectureContent={enhancedContext}
              lectureTitle={`${attempt.lecture.title} - Quiz Results`}
              lectureId={lectureId}
              mode="sidebar"
            />
          </div>
        </div>

        {/* AI Floating Button - Mobile Only */}
        <div className="lg:hidden">
          <AIChatAssistant
            lectureContent={enhancedContext}
            lectureTitle={`${attempt.lecture.title} - Quiz Results`}
            lectureId={lectureId}
            mode="floating"
          />
        </div>
      </div>
    </div>
  );
}
