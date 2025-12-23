import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, User } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getPublishedCourses } from "@/actions/course.actions";
import { isEnrolled } from "@/actions/enrollment.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CourseCatalogPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const coursesResult = await getPublishedCourses();
  const courses = coursesResult.success ? coursesResult.data : [];

  const categoryColors: Record<string, string> = {
    programming: "bg-blue-100 text-blue-800",
    design: "bg-purple-100 text-purple-800",
    business: "bg-green-100 text-green-800",
    marketing: "bg-orange-100 text-orange-800",
    "data-science": "bg-pink-100 text-pink-800",
    other: "bg-muted text-foreground",
  };

  // Check enrollment status for each course
  const coursesWithEnrollment = await Promise.all(
    courses!.map(async (course) => {
      const enrollmentResult = await isEnrolled(session.user.id, course._id);
      return {
        ...course,
        isEnrolled: enrollmentResult.success && enrollmentResult.data?.enrolled,
      };
    })
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Course Catalog
        </h1>
        <p className="text-muted-foreground">
          Browse and enroll in courses to start learning
        </p>
      </div>

        {/* Courses Grid */}
        {courses && courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coursesWithEnrollment.map((course) => (
              <Card
                key={course._id}
                className="flex flex-col hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3">
                    {/* Category Badge */}
                    <Badge
                      variant="secondary"
                      className={
                        categoryColors[course.category] || categoryColors.other
                      }
                    >
                      {course.category.replace("-", " ")}
                    </Badge>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{course.instructorName}</span>
                    </div>

                    {/* Lecture Count */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {course.lectureCount}{" "}
                        {course.lectureCount === 1 ? "lecture" : "lectures"}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  {course.isEnrolled ? (
                    <Button asChild className="w-full" variant="outline">
                      <Link href={`/student/courses/${course._id}`}>
                        Continue Learning
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={`/student/courses/${course._id}`}>
                        View Course
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                No courses available
              </h3>
              <p className="text-muted-foreground">
                Check back later for new courses
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
