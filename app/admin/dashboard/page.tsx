import { getPlatformStats, getTrendingCourses } from "@/actions/admin.actions";
import { StatCard } from "@/components/admin/stat-card";
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  ClipboardCheck,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminDashboard() {
  const statsResult = await getPlatformStats();
  const trendingResult = await getTrendingCourses(5);

  if (!statsResult.success || !statsResult.data) {
    return (
      <div className="text-center">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const stats = statsResult.data;
  const trending = trendingResult.success ? trendingResult.data || [] : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your platform statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          iconColor="text-blue-600"
          description="Registered student accounts"
        />
        <StatCard
          title="Total Instructors"
          value={stats.totalInstructors}
          icon={GraduationCap}
          iconColor="text-purple-600"
          description="Active course creators"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          iconColor="text-green-600"
          description={`${stats.publishedCourses} published`}
        />
        <StatCard
          title="Total Enrollments"
          value={stats.totalEnrollments}
          icon={UserCheck}
          iconColor="text-orange-600"
          description="Student course enrollments"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Quiz Attempts"
          value={stats.totalQuizAttempts}
          icon={ClipboardCheck}
          iconColor="text-indigo-600"
          description="Total quizzes taken"
        />
        <StatCard
          title="Average Rating"
          value={stats.averagePlatformRating.toFixed(1)}
          icon={Star}
          iconColor="text-yellow-600"
          description={`From ${stats.totalReviews} reviews`}
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          icon={Star}
          iconColor="text-pink-600"
          description="Course reviews"
        />
      </div>

      {/* Trending Courses */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trending Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {trending.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No courses available
              </p>
            ) : (
              <div className="space-y-4">
                {trending.map((course, index) => (
                  <div
                    key={course._id}
                    className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-semibold">{course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by {course.instructorName}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrollments} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {course.averageRating.toFixed(1)} ({course.totalReviews})
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                href="/admin/students"
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">View All Students</p>
                    <p className="text-sm text-muted-foreground">
                      Manage student accounts
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/instructors"
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">View All Instructors</p>
                    <p className="text-sm text-muted-foreground">
                      Manage instructor accounts
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
