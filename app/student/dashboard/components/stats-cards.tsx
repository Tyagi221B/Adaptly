import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BookOpen, TrendingUp, Award } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getMyEnrollments } from "@/actions/enrollment.actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function StatsCards() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const enrollmentsResult = await getMyEnrollments(session.user.id);
  const enrollments = enrollmentsResult.success ? enrollmentsResult.data || [] : [];

  // Calculate stats
  const totalEnrollments = enrollments.length;
  const totalLectures = enrollments.reduce((sum, e) => sum + e.totalLectures, 0);
  const completedLectures = enrollments.reduce((sum, e) => sum + e.completedLectures, 0);
  const completedCourses = enrollments.filter((e) => e.progressPercentage === 100).length;
  const overallProgress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  if (enrollments.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium sm:text-sm">
            Enrolled Courses
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold sm:text-2xl">
            {totalEnrollments}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium sm:text-sm">
            Lectures Completed
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold sm:text-2xl">
            {completedLectures}/{totalLectures}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium sm:text-sm">
            Courses Completed
          </CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold sm:text-2xl">
            {completedCourses}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium sm:text-sm">
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold sm:text-2xl">
            {overallProgress}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
