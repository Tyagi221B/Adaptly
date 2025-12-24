"use client";

import { useState, useMemo } from "react";
import { BookOpen, TrendingUp, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StaggerGrid } from "@/components/ui/stagger-grid";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { CourseCard } from "@/components/shared/course-card";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/shared/category-filter";
import { EmptyState } from "@/components/shared/empty-state";

interface EnrollmentData {
  _id: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseCategory: string;
  courseThumbnail?: string;
  courseInstructorName: string;
  courseAverageRating: number;
  courseTotalReviews: number;
  enrolledAt: Date;
  totalLectures: number;
  completedLectures: number;
  progressPercentage: number;
}

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

interface DashboardClientProps {
  userName: string;
  userId: string;
  enrollments: EnrollmentData[];
  availableCourses: CourseData[];
}

export function DashboardClient({
  userName,
  userId,
  enrollments,
  availableCourses,
}: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Calculate stats
  const totalEnrollments = enrollments.length;
  const totalLectures = enrollments.reduce((sum, e) => sum + e.totalLectures, 0);
  const completedLectures = enrollments.reduce((sum, e) => sum + e.completedLectures, 0);
  const completedCourses = enrollments.filter((e) => e.progressPercentage === 100).length;

  // Get unique categories from available courses
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    availableCourses.forEach((course) => {
      const count = categoryMap.get(course.category) || 0;
      categoryMap.set(course.category, count + 1);
    });

    return Array.from(categoryMap.entries()).map(([value, count]) => ({
      value,
      label: value.replace("-", " "),
      count,
    }));
  }, [availableCourses]);

  // Filter available courses
  const filteredCourses = useMemo(() => {
    return availableCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [availableCourses, searchQuery, selectedCategory]);

  return (
    <main className="container mx-auto py-8 px-4">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {userName}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          {enrollments.length > 0
            ? "Ready to continue your learning journey?"
            : "Start your learning journey by enrolling in a course"}
        </p>
      </div>

      {/* Stats Cards (only show if enrolled in courses) */}
      {enrollments.length > 0 && (
        <StaggerGrid className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium sm:text-sm">
                Enrolled Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold sm:text-2xl">
                <AnimatedCounter value={totalEnrollments} />
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
                <AnimatedCounter value={completedLectures} />
                <span>/</span>
                <AnimatedCounter value={totalLectures} />
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
                <AnimatedCounter value={completedCourses} />
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
                <AnimatedCounter
                  value={
                    totalLectures > 0
                      ? Math.round((completedLectures / totalLectures) * 100)
                      : 0
                  }
                  suffix="%"
                />
              </div>
            </CardContent>
          </Card>
        </StaggerGrid>
      )}

      {/* Enrolled Courses Section */}
      {enrollments.length > 0 && (
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
          </div>

          <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <CourseCard
                key={enrollment._id}
                course={{
                  _id: enrollment.courseId,
                  title: enrollment.courseTitle,
                  description: enrollment.courseDescription,
                  category: enrollment.courseCategory,
                  thumbnail: enrollment.courseThumbnail,
                  instructorName: enrollment.courseInstructorName,
                  lectureCount: enrollment.totalLectures,
                  averageRating: enrollment.courseAverageRating,
                  totalReviews: enrollment.courseTotalReviews,
                }}
                variant="enrolled"
                enrollmentData={{
                  progressPercentage: enrollment.progressPercentage,
                  completedLectures: enrollment.completedLectures,
                  totalLectures: enrollment.totalLectures,
                }}
              />
            ))}
          </StaggerGrid>
        </div>
      )}

      {/* Divider */}
      {enrollments.length > 0 && availableCourses.length > 0 && (
        <div className="mb-12 border-t" />
      )}

      {/* Available Courses Section */}
      {availableCourses.length > 0 ? (
        <div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {enrollments.length > 0 ? "Discover More Courses" : "Browse All Courses"}
            </h2>
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search courses..."
              className="w-full sm:w-80"
            />
          </div>

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            className="mb-6"
          />

          {/* Course Grid */}
          {filteredCourses.length > 0 ? (
            <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  variant="available"
                  studentId={userId}
                />
              ))}
            </StaggerGrid>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No courses found"
              description="Try adjusting your search or filters"
            />
          )}
        </div>
      ) : (
        enrollments.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="No courses available"
            description="Check back later for new courses"
          />
        )
      )}
    </main>
  );
}
