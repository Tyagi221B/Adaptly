import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen, Award, TrendingUp } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getStudentProgressAcrossInstructorCourses } from "@/actions/instructor.actions";
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

export default async function StudentAllCoursesPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { studentId } = await params;

  // Get student progress across all instructor's courses
  const result = await getStudentProgressAcrossInstructorCourses(
    studentId,
    session.user.id
  );

  if (!result.success || !result.data) {
    redirect("/instructor/students");
  }

  const progress = result.data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/instructor/students">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to All Students
          </Link>
        </Button>

        {/* Student Profile Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={progress.studentAvatar}
              alt={progress.studentName}
            />
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
              <span>
                Enrolled in {progress.totalEnrollments} course
                {progress.totalEnrollments !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Overall Progress</CardDescription>
              <CardTitle className="text-3xl">
                {progress.overallProgress.percentage}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {progress.overallProgress.completed} of{" "}
                {progress.overallProgress.total} lectures
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${progress.overallProgress.percentage}%`,
                  }}
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
                {progress.overallQuizzes.passed}/
                {progress.overallQuizzes.totalAttempts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {progress.overallQuizzes.totalAttempts > 0
                  ? Math.round(
                      (progress.overallQuizzes.passed /
                        progress.overallQuizzes.totalAttempts) *
                        100
                    )
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
              <CardTitle className="text-3xl">
                {progress.overallQuizzes.averageScore}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Across {progress.overallQuizzes.totalAttempts} attempt
                {progress.overallQuizzes.totalAttempts !== 1 ? "s" : ""}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Courses
              </CardDescription>
              <CardTitle className="text-3xl">
                {progress.totalEnrollments}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Total enrollments
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course-by-Course Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Progress by Course</CardTitle>
            <CardDescription>
              Detailed breakdown across all enrolled courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progress.courses.map((course) => (
                <div
                  key={course.courseId}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {course.courseTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Enrolled{" "}
                        {new Date(course.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/instructor/courses/${course.courseId}/students/${studentId}`}
                      >
                        View Details →
                      </Link>
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Progress */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Progress
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {course.progress.percentage}%
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {course.progress.completed}/{course.progress.total}{" "}
                          lectures
                        </Badge>
                      </div>
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${course.progress.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Quizzes */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Quizzes
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {course.quizzes.passed}/{course.quizzes.totalAttempts}
                        </span>
                        <Badge
                          variant={
                            course.quizzes.totalAttempts > 0 &&
                            course.quizzes.passed / course.quizzes.totalAttempts >= 0.7
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {course.quizzes.totalAttempts > 0
                            ? Math.round(
                                (course.quizzes.passed / course.quizzes.totalAttempts) * 100
                              )
                            : 0}
                          % pass rate
                        </Badge>
                      </div>
                    </div>

                    {/* Average Score */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Average Score
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-2xl">
                          {course.quizzes.averageScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
