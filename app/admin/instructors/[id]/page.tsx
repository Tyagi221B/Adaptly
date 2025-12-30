import { getInstructorDetails } from "@/actions/admin.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Star,
  Mail,
  Calendar,
  Linkedin,
  Github,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { redirect } from "next/navigation";

export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getInstructorDetails(id);

  if (!result.success || !result.data) {
    redirect("/admin/instructors");
  }

  const instructor = result.data;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/instructors">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Instructors
        </Button>
      </Link>

      {/* Instructor Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={instructor.profilePicture} />
              <AvatarFallback className="text-2xl">
                {instructor.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{instructor.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {instructor.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined{" "}
                  {formatDistanceToNow(new Date(instructor.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {instructor.bio && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {instructor.bio}
                </p>
              )}
              {(instructor.linkedIn || instructor.github) && (
                <div className="mt-3 flex gap-3">
                  {instructor.linkedIn && (
                    <a
                      href={instructor.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {instructor.github && (
                    <a
                      href={instructor.github}
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
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructor.totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {instructor.publishedCourses}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructor.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {instructor.averageRating.toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {instructor.courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No courses yet</p>
          ) : (
            <div className="space-y-4">
              {instructor.courses.map((course) => (
                <div key={course._id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{course.title}</h3>
                        <Badge variant={course.isPublished ? "default" : "secondary"}>
                          {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {course.description}
                      </p>
                    </div>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Students</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">
                          {course.enrolledStudents}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lectures</p>
                      <div className="mt-1 flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">
                          {course.totalLectures}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quizzes</p>
                      <div className="mt-1 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">{course.totalQuizzes}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {course.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reviews</p>
                      <span className="mt-1 block font-medium">
                        {course.totalReviews}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    Created{" "}
                    {formatDistanceToNow(new Date(course.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
