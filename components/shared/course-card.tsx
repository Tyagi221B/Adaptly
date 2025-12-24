"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, BookOpen, Users } from "lucide-react";
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

interface CourseData {
  _id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  instructorName: string;
  lectureCount: number;
  averageRating: number;
  totalReviews: number;
  enrolledStudentsCount?: number;
}

interface EnrollmentData {
  progressPercentage: number;
  completedLectures: number;
  totalLectures: number;
}

interface CourseCardProps {
  course: CourseData;
  variant: "featured" | "available" | "enrolled";
  enrollmentData?: EnrollmentData;
  studentId?: string;
}

const categoryColors: Record<string, string> = {
  programming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  design: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  marketing: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "data-science": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export function CourseCard({ course, variant, enrollmentData, studentId }: CourseCardProps) {
  const renderCTA = () => {
    if (variant === "featured") {
      return (
        <Button asChild className="w-full">
          <Link href={`/courses/${course._id}`}>
            View Details
          </Link>
        </Button>
      );
    }

    if (variant === "available") {
      return (
        <Button asChild className="w-full">
          <Link href={`/courses/${course._id}`}>
            View Details
          </Link>
        </Button>
      );
    }

    if (variant === "enrolled") {
      return (
        <Button asChild className="w-full">
          <Link href={`/courses/${course._id}`}>
            Continue Learning
          </Link>
        </Button>
      );
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
        <Image
          src={course.thumbnail || "/placeholder-course.jpg"}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <CardHeader className="flex-1">
        {/* Category and Rating */}
        <div className="flex items-center justify-between mb-2">
          <Badge
            variant="secondary"
            className={categoryColors[course.category] || categoryColors.other}
          >
            {course.category.replace("-", " ")}
          </Badge>

          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{course.averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({course.totalReviews})</span>
          </div>
        </div>

        <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Instructor and Lectures */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lectureCount} lectures</span>
          </div>
          {course.enrolledStudentsCount !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.enrolledStudentsCount} students</span>
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          By {course.instructorName}
        </div>

        {/* Progress Bar (only for enrolled) */}
        {variant === "enrolled" && enrollmentData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{enrollmentData.progressPercentage}%</span>
            </div>
            <Progress value={enrollmentData.progressPercentage} />
            <p className="text-xs text-muted-foreground">
              {enrollmentData.completedLectures} of {enrollmentData.totalLectures} lectures completed
            </p>
          </div>
        )}

        {/* CTA Button */}
        {renderCTA()}
      </CardContent>
    </Card>
  );
}
