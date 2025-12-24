import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen, CheckCircle2, Circle, Lock } from "lucide-react";
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
import { ReviewForm } from "@/components/student/review-form";
import { ReviewsList } from "@/components/student/reviews-list";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  // STEP 1: Get session (but DON'T redirect if not logged in)
  const session = await getServerSession(authOptions);

  const { courseId } = await params;

  // Fetch course details
  const courseResult = await getCourseForStudent(courseId);

  if (!courseResult.success || !courseResult.data) {
    redirect("/");
  }

  const { course, lectures } = courseResult.data;

  // STEP 2: Check enrollment ONLY if logged in
  let enrolled = false;
  let completedLectureIds: string[] = [];

  if (session) {
    const enrollmentResult = await isEnrolled(session.user.id, courseId);
    enrolled = enrollmentResult.success && enrollmentResult.data?.enrolled || false;

    if (enrolled) {
      const enrollmentDetails = await getEnrollmentDetails(
        session.user.id,
        courseId
      );
      if (enrollmentDetails.success && enrollmentDetails.data) {
        completedLectureIds = enrollmentDetails.data.completedLectures;
      }
    }
  }

  const categoryColors: Record<string, string> = {
    programming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    design: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    marketing: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "data-science": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    other: "bg-muted text-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        {/* Course Header */}
        <div className="mb-8">
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
            {enrolled && <Badge variant="default">Enrolled</Badge>}
          </div>

          {/* Instructor Message (if exists) */}
          {course.instructorMessage && (
            <Card className="mt-4 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm italic text-muted-foreground">
                  &quot;{course.instructorMessage}&quot;
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* STEP 3: Dynamic CTA based on auth state */}
        {!enrolled && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {!session ? "Start Your Learning Journey" : "Ready to start learning?"}
              </CardTitle>
              <CardDescription>
                {!session
                  ? "Sign up to enroll in this course and access all lectures and quizzes"
                  : "Enroll in this course to access all lectures and quizzes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {lectures.length}{" "}
                    {lectures.length === 1 ? "lecture" : "lectures"}
                  </span>
                </div>
              </div>

              {/* STEP 4: Different buttons for different states */}
              {!session ? (
                // Not logged in - Show "Sign Up to Enroll" with redirect param
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href={`/signup?redirect=/courses/${courseId}`}>
                    Sign Up to Enroll
                  </Link>
                </Button>
              ) : (
                // Logged in but not enrolled - Show EnrollButton
                <EnrollButton courseId={courseId} studentId={session.user.id} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Course Content - Show lecture TITLES for everyone, but lock content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {enrolled
                    ? `${completedLectureIds.length} of ${lectures.length} lectures completed`
                    : `${lectures.length} lectures in this course`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {lectures.length > 0 ? (
              <div className="space-y-3">
                {lectures.map((lecture) => {
                  const isCompleted = completedLectureIds.includes(lecture._id);

                  return enrolled ? (
                    // Enrolled users - Can access lectures
                    <Link
                      key={lecture._id}
                      href={`/student/courses/${courseId}/lectures/${lecture._id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
                            {lecture.order}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground">
                                {lecture.title}
                              </h3>
                              {isCompleted && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {isCompleted ? "Completed" : "Not started"}
                            </p>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm">
                          {isCompleted ? "Review" : "Start"} →
                        </Button>
                      </div>
                    </Link>
                  ) : (
                    // Not enrolled - Show locked lecture preview
                    <div
                      key={lecture._id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4 opacity-60"
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
                            Enroll to access
                          </p>
                        </div>
                      </div>

                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Circle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  No lectures yet
                </h3>
                <p className="text-muted-foreground">
                  The instructor hasn&apos;t added any lectures to this course yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews Section - Public, everyone can see */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Write Review (only for enrolled students) */}
          {session && enrolled && (
            <div>
              <ReviewForm
                courseId={courseId}
                studentId={session.user.id}
                courseName={course.title}
              />
            </div>
          )}

          {/* All Reviews - Public */}
          <div className={session && enrolled ? "" : "lg:col-span-2"}>
            <Suspense
              fallback={
                <Card>
                  <CardContent className="py-8">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              }
            >
              <ReviewsList courseId={courseId} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
