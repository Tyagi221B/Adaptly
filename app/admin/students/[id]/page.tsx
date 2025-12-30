import { getStudentDetails } from "@/actions/admin.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Mail,
  Calendar,
  Linkedin,
  Github,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { redirect } from "next/navigation";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getStudentDetails(id);

  if (!result.success || !result.data) {
    redirect("/admin/students");
  }

  const student = result.data;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/students">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Button>
      </Link>

      {/* Student Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={student.profilePicture} />
              <AvatarFallback className="text-2xl">
                {student.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{student.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined{" "}
                  {formatDistanceToNow(new Date(student.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {student.bio && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {student.bio}
                </p>
              )}
              {(student.linkedIn || student.github) && (
                <div className="mt-3 flex gap-3">
                  {student.linkedIn && (
                    <a
                      href={student.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {student.github && (
                    <a
                      href={student.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:underline"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.enrollmentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {student.quizStats.totalPassed}
            </div>
            <p className="text-xs text-muted-foreground">
              {student.quizStats.passRate}% pass rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.averageScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {student.quizStats.totalAttempts}
            </div>
            <p className="text-xs text-muted-foreground">
              {student.quizStats.totalFailed} failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Course Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          {student.enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No enrollments yet
            </p>
          ) : (
            <div className="space-y-4">
              {student.enrollments.map((enrollment) => (
                <div
                  key={enrollment.courseId}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{enrollment.courseTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {enrollment.instructorName}
                      </p>
                    </div>
                    <Badge
                      variant={
                        enrollment.progressPercentage === 100
                          ? "default"
                          : "secondary"
                      }
                    >
                      {enrollment.progressPercentage}% Complete
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <Progress value={enrollment.progressPercentage} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Lectures</p>
                      <p className="font-medium">
                        {enrollment.completedLectures} / {enrollment.totalLectures}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quizzes</p>
                      <p className="font-medium">
                        {enrollment.quizzesPassed} / {enrollment.quizzesTaken} passed
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Score</p>
                      <p className="font-medium">{enrollment.averageQuizScore}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      {student.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {student.reviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{review.courseTitle}</h3>
                      <div className="mt-1 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
