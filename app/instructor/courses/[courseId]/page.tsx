import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Settings, Pencil } from "lucide-react";
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
import PublishToggle from "@/components/instructor/publish-toggle";

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
    other: "bg-muted text-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/instructor/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Course Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              {course.title}
            </h1>
            <p className="mb-4 text-muted-foreground">{course.description}</p>
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

          <div className="flex gap-3">
            <PublishToggle
              courseId={courseId}
              instructorId={session.user.id}
              isPublished={course.isPublished}
            />
            <Button variant="outline" asChild className="flex-1 md:flex-none">
              <Link href={`/instructor/courses/${courseId}/edit`}>
                <Settings className="mr-2 h-4 w-4" />
                Edit Course
              </Link>
            </Button>
          </div>
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
                  <div
                    key={lecture._id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
                        {lecture.order}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {lecture.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Added{" "}
                          {new Date(lecture.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/instructor/courses/${courseId}/lectures/${lecture._id}/edit`}
                        >
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/instructor/courses/${courseId}/lectures/${lecture._id}/quiz`}
                        >
                          Quiz →
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  No lectures yet
                </h3>
                <p className="mb-4 text-muted-foreground">
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
