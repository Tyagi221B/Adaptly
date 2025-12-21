import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, TrendingUp, Award } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { getMyEnrollments } from "@/actions/enrollment.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch enrollments
  const enrollmentsResult = await getMyEnrollments(session.user.id);
  const enrollments = enrollmentsResult.success ? enrollmentsResult.data : [];

  // Calculate stats
  const totalEnrollments = enrollments?.length || 0;
  const totalLectures =
    enrollments?.reduce((sum, e) => sum + e.totalLectures, 0) || 0;
  const completedLectures =
    enrollments?.reduce((sum, e) => sum + e.completedLectures, 0) || 0;
  const completedCourses =
    enrollments?.filter((e) => e.progressPercentage === 100).length || 0;

  const categoryColors: Record<string, string> = {
    programming: "bg-blue-100 text-blue-800",
    design: "bg-purple-100 text-purple-800",
    business: "bg-green-100 text-green-800",
    marketing: "bg-orange-100 text-orange-800",
    "data-science": "bg-pink-100 text-pink-800",
    other: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Enrolled Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lectures Completed
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedLectures}/{totalLectures}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Courses Completed
              </CardTitle>
              <Award className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalLectures > 0
                  ? Math.round((completedLectures / totalLectures) * 100)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          <Button asChild>
            <Link href="/student/courses">Browse Courses</Link>
          </Button>
        </div>

        {enrollments && enrollments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Card
                key={enrollment._id}
                className="flex flex-col hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {enrollment.courseTitle}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {enrollment.courseDescription}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-4">
                    {/* Category Badge */}
                    <Badge
                      variant="secondary"
                      className={
                        categoryColors[enrollment.courseCategory] ||
                        categoryColors.other
                      }
                    >
                      {enrollment.courseCategory.replace("-", " ")}
                    </Badge>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">
                          {enrollment.progressPercentage}%
                        </span>
                      </div>
                      <Progress value={enrollment.progressPercentage} />
                      <p className="text-xs text-gray-500">
                        {enrollment.completedLectures} of{" "}
                        {enrollment.totalLectures} lectures completed
                      </p>
                    </div>

                    {/* Continue Button */}
                    <Button asChild className="w-full">
                      <Link
                        href={`/student/courses/${enrollment.courseId}`}
                      >
                        Continue Learning
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No courses yet
              </h3>
              <p className="mb-4 text-gray-600">
                Start your learning journey by enrolling in a course
              </p>
              <Button asChild>
                <Link href="/student/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
