import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Types } from "mongoose";
import { ChevronLeft, ArrowRight } from "lucide-react";
import MarkdownIt from "markdown-it";
import type { Options } from "markdown-it/lib/index.mjs";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";
import type Token from "markdown-it/lib/token.mjs";
import { common, createLowlight } from "lowlight";
import type { Root, Element, Text } from "hast";
import { authOptions } from "@/lib/auth-config";
import { getLectureForStudent, getCourseLectures } from "@/actions/lecture.actions";
import { getQuizForStudent } from "@/actions/quiz.actions";
import { isEnrolled, getEnrollmentByCourseId } from "@/actions/enrollment.actions";
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
import MarkCompleteButton from "@/components/student/mark-complete-button";
import AIChatAssistant from "@/components/student/ai-chat-assistant";

const lowlight = createLowlight(common);

function processNode(node: Element | Text): string {
  if (node.type === "element") {
    const element = node as Element;
    const classes = (element.properties?.className as string[]) || [];
    const childrenHtml = element.children.map((child) => processNode(child as Element | Text)).join("");
    return `<span class="${classes.join(" ")}">${childrenHtml}</span>`;
  }
  return (node as Text).value || "";
}

const md: MarkdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
  highlight: function (str: string, lang: string): string {
    if (lang && lowlight.registered(lang)) {
      try {
        const result: Root = lowlight.highlight(lang, str);
        return (
          '<pre class="hljs"><code>' +
          result.children.map((node) => processNode(node as Element | Text)).join("") +
          "</code></pre>"
        );
      } catch (err) {
        console.error("Syntax highlighting error:", err);
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>";
  },
});

// Ensure lecture links open in a new tab for students
const defaultLinkOpen: RenderRule =
  md.renderer.rules.link_open ||
  function (tokens: Token[], idx: number, options: Options, _env: unknown, self): string {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = (tokens: Token[], idx: number, options: Options, env: unknown, self): string => {
  const token = tokens[idx];

  const setAttr = (name: string, value: string) => {
    const index = token.attrIndex(name);
    if (index < 0) {
      token.attrPush([name, value]);
    } else {
      token.attrs![index][1] = value;
    }
  };

  setAttr("target", "_blank");
  setAttr("rel", "noopener noreferrer");

  return defaultLinkOpen(tokens, idx, options, env, self);
};

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

  // Check if lecture is already completed
  const enrollmentData = await getEnrollmentByCourseId(session.user.id, courseId);
  const completedLectureIds = enrollmentData.success && enrollmentData.data
    ? enrollmentData.data.completedLectures.map((id: Types.ObjectId) => id.toString())
    : [];
  const isLectureCompleted = completedLectureIds.includes(lectureId);

  // Get all lectures to find the next one
  const lecturesResult = await getCourseLectures(courseId, session.user.id);
  const allLectures = lecturesResult.success && lecturesResult.data
    ? lecturesResult.data.sort((a, b) => a.order - b.order)
    : [];

  const currentLectureIndex = allLectures.findIndex(l => l._id === lectureId);
  const nextLecture = currentLectureIndex !== -1 && currentLectureIndex < allLectures.length - 1
    ? allLectures[currentLectureIndex + 1]
    : null;

  return (
    <div className="min-h-screen bg-background">
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
            <div className="mb-2 inline-block rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              Lecture {lecture.order}
            </div>
            <CardTitle className="text-2xl">{lecture.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div
              className="ProseMirror student-lecture-readonly"
              dangerouslySetInnerHTML={{ __html: md.render(lecture.content) }}
            />
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
                  <div className="rounded-lg bg-muted p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-foreground">
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
                    <p className="text-sm text-muted-foreground">
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
                    {!latestAttempt.passed ? (
                      <QuizTaker
                        quiz={quiz}
                        lectureId={lectureId}
                        courseId={courseId}
                        studentId={session.user.id}
                      />
                    ) : nextLecture ? (
                      <Button asChild className="flex-1">
                        <Link
                          href={`/student/courses/${courseId}/lectures/${nextLecture._id}`}
                        >
                          Next Lecture
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}
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
            <CardHeader>
              <CardTitle>Complete This Lecture</CardTitle>
              <CardDescription>
                Mark this lecture as complete to track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkCompleteButton
                studentId={session.user.id}
                courseId={courseId}
                lectureId={lectureId}
                isCompleted={isLectureCompleted}
                nextLectureId={nextLecture?._id}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <AIChatAssistant
        lectureContent={lecture.content}
        lectureTitle={lecture.title}
      />
    </div>
  );
}
