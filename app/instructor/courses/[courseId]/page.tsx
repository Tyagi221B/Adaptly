import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Settings } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getCourseById } from "@/actions/course.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId } = await params;
  const result = await getCourseById(courseId, session.user.id);

  if (!result.success || !result.data) {
    redirect("/instructor/dashboard");
  }

  const { course, lectures } = result.data;

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
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/instructor/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Course Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {course.title}
            </h1>
            <p className="mb-4 text-gray-600">{course.description}</p>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={categoryColors[course.category] || categoryColors.other}
              >
                {course.category.replace("-", " ")}
              </Badge>
              {course.isPublished ? (
                <Badge variant="default">Published</Badge>
              ) : (
                <Badge variant="outline">Draft</Badge>
              )}
            </div>
          </div>

          <Button variant="outline" asChild>
            <Link href={`/instructor/courses/${courseId}/edit`}>
              <Settings className="mr-2 h-4 w-4" />
              Edit Course
            </Link>
          </Button>
        </div>

        {/* Lectures Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lectures</CardTitle>
                <CardDescription>
                  Manage course content and learning materials
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/instructor/courses/${courseId}/lectures/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lecture
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lectures.length > 0 ? (
              <div className="space-y-3">
                {lectures.map((lecture) => (
                  <Link
                    key={lecture._id}
                    href={`/instructor/courses/${courseId}/lectures/${lecture._id}/quiz`}
                    className="block"
                  >
                    <div className="flex items-center justify-between rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600">
                          {lecture.order}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {lecture.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Added{" "}
                            {new Date(lecture.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm">
                        View →
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No lectures yet
                </h3>
                <p className="mb-4 text-gray-600">
                  Start building your course by adding your first lecture
                </p>
                <Button asChild>
                  <Link href={`/instructor/courses/${courseId}/lectures/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Lecture
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
