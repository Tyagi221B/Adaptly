import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen, CheckCircle2, Circle } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getCourseForStudent } from "@/actions/course.actions";
import { isEnrolled, getEnrollmentDetails } from "@/actions/enrollment.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EnrollButton from "@/components/student/enroll-button";

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId } = await params;

  // Fetch course details
  const courseResult = await getCourseForStudent(courseId);

  if (!courseResult.success || !courseResult.data) {
    redirect("/student/courses");
  }

  const { course, lectures } = courseResult.data;

  // Check enrollment status
  const enrollmentResult = await isEnrolled(session.user.id, courseId);
  const enrolled = enrollmentResult.success && enrollmentResult.data?.enrolled;

  // Get enrollment details if enrolled
  let completedLectureIds: string[] = [];
  if (enrolled) {
    const enrollmentDetails = await getEnrollmentDetails(
      session.user.id,
      courseId
    );
    if (enrollmentDetails.success && enrollmentDetails.data) {
      completedLectureIds = enrollmentDetails.data.completedLectures;
    }
  }

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
          <Link href="/student/courses">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Link>
        </Button>

        {/* Course Header */}
        <div className="mb-8">
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
            {enrolled && <Badge variant="default">Enrolled</Badge>}
          </div>
        </div>

        {/* Enrollment Section */}
        {!enrolled ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ready to start learning?</CardTitle>
              <CardDescription>
                Enroll in this course to access all lectures and quizzes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {lectures.length}{" "}
                    {lectures.length === 1 ? "lecture" : "lectures"}
                  </span>
                </div>
              </div>
              <EnrollButton courseId={courseId} studentId={session.user.id} />
            </CardContent>
          </Card>
        ) : (
          /* Lectures Section */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Content</CardTitle>
                  <CardDescription>
                    {completedLectureIds.length} of {lectures.length} lectures completed
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {lectures.length > 0 ? (
                <div className="space-y-3">
                  {lectures.map((lecture) => {
                    const isCompleted = completedLectureIds.includes(
                      lecture._id
                    );

                    return (
                      <Link
                        key={lecture._id}
                        href={`/student/courses/${courseId}/lectures/${lecture._id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600">
                              {lecture.order}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900">
                                  {lecture.title}
                                </h3>
                                {isCompleted && (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {isCompleted ? "Completed" : "Not started"}
                              </p>
                            </div>
                          </div>

                          <Button variant="ghost" size="sm">
                            {isCompleted ? "Review" : "Start"} →
                          </Button>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Circle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No lectures yet
                  </h3>
                  <p className="text-gray-600">
                    The instructor hasn&apos;t added any lectures to this course yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
