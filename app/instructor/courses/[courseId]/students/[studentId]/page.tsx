import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Circle, Award, TrendingUp } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getStudentCourseProgress } from "@/actions/instructor.actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; studentId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId, studentId } = await params;

  // Get student progress
  const result = await getStudentCourseProgress(
    courseId,
    studentId,
    session.user.id
  );

  if (!result.success || !result.data) {
    redirect(`/instructor/courses/${courseId}/students`);
  }

  const progress = result.data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/instructor/courses/${courseId}/students`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Link>
        </Button>

        {/* Student Profile Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src={progress.studentAvatar} alt={progress.studentName} />
            <AvatarFallback className="text-2xl">
              {progress.studentName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {progress.studentName}
            </h1>
            <p className="text-muted-foreground mb-4">{progress.studentEmail}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Enrolled {new Date(progress.enrolledAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{progress.courseTitle}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Overall Progress</CardDescription>
              <CardTitle className="text-3xl">{progress.progress.percentage}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {progress.progress.completed} of {progress.progress.total} lectures
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress.progress.percentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Quizzes Passed
              </CardDescription>
              <CardTitle className="text-3xl">
                {progress.quizzes.passed}/{progress.quizzes.totalAttempts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {progress.quizzes.totalAttempts > 0
                  ? Math.round((progress.quizzes.passed / progress.quizzes.totalAttempts) * 100)
                  : 0}
                % pass rate
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average Score
              </CardDescription>
              <CardTitle className="text-3xl">{progress.quizzes.averageScore}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Across {progress.quizzes.totalAttempts} attempt{progress.quizzes.totalAttempts !== 1 ? "s" : ""}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Failed Quizzes</CardDescription>
              <CardTitle className="text-3xl">{progress.quizzes.failed}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Needs attention
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lecture Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Lecture Progress</CardTitle>
              <CardDescription>
                Completion status for all lectures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progress.lectures.map((lecture) => (
                  <div
                    key={lecture._id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="mt-0.5">
                      {lecture.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">
                          {lecture.order}. {lecture.title}
                        </p>
                        {lecture.hasQuiz && (
                          <Badge variant="secondary" className="text-xs">
                            Quiz
                          </Badge>
                        )}
                      </div>
                      {lecture.quizAttempts && lecture.quizAttempts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {lecture.quizAttempts.map((attempt, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <span>
                                {new Date(attempt.attemptedAt).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span className={attempt.passed ? "text-primary" : "text-destructive"}>
                                {attempt.score}% {attempt.passed ? "✓" : "✗"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Quiz Attempts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quiz Attempts</CardTitle>
              <CardDescription>
                Latest 5 quiz submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {progress.recentQuizAttempts.length > 0 ? (
                <div className="space-y-3">
                  {progress.recentQuizAttempts.map((attempt) => (
                    <div
                      key={attempt._id}
                      className="flex items-start justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">
                          {attempt.lectureTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(attempt.attemptedAt).toLocaleDateString()} •{" "}
                          {new Date(attempt.attemptedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          {attempt.score}%
                        </span>
                        <Badge
                          variant={attempt.passed ? "default" : "destructive"}
                          className="ml-2"
                        >
                          {attempt.passed ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No quiz attempts yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
