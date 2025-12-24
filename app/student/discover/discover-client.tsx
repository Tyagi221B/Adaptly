"use client";

import { useState, useMemo } from "react";
import { Search, Sparkles, TrendingUp, Zap } from "lucide-react";
import { CourseCard } from "@/components/shared/course-card";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/shared/category-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { StaggerGrid } from "@/components/ui/stagger-grid";
import { Badge } from "@/components/ui/badge";

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

interface DiscoverClientProps {
  userId: string;
  allCourses: CourseData[];
  enrolledCourseIds: Set<string>;
}

export function DiscoverClient({
  userId,
  allCourses,
  enrolledCourseIds,
}: DiscoverClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Get unique categories
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    allCourses.forEach((course) => {
      const count = categoryMap.get(course.category) || 0;
      categoryMap.set(course.category, count + 1);
    });

    return Array.from(categoryMap.entries()).map(([value, count]) => ({
      value,
      label: value.replace("-", " "),
      count,
    }));
  }, [allCourses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allCourses, searchQuery, selectedCategory]);

  const enrolledCount = enrolledCourseIds.size;
  const totalCount = allCourses.length;

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="border-b bg-linear-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <Badge className="px-3 py-1.5 text-xs font-medium" variant="outline">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
              {totalCount} Courses · {enrolledCount} Enrolled
            </Badge>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Master skills that matter
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Learn with AI-powered personalized courses. Adaptly helps you build
                in-demand skills and advance your career with adaptive learning.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-3 gap-4 pt-4 max-w-2xl mx-auto text-sm">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4 text-primary" />
                <span>AI-Powered Learning</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Personalized Content</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Search className="w-4 h-4 text-primary" />
                <span>Expert Instructors</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="pt-4 max-w-2xl mx-auto">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Search by title, topic, or instructor..."
                className="h-12 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          className="mb-8"
        />

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {searchQuery || selectedCategory !== "all" ? (
              <>
                Showing <span className="font-semibold">{filteredCourses.length}</span> of{" "}
                <span className="font-semibold">{totalCount}</span> courses
                {selectedCategory !== "all" && (
                  <span className="ml-1">
                    in{" "}
                    <span className="font-semibold">
                      {selectedCategory.replace("-", " ")}
                    </span>
                  </span>
                )}
              </>
            ) : (
              <>
                Showing all <span className="font-semibold">{totalCount}</span> courses
              </>
            )}
          </p>
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.has(course._id.toString());

              return (
                <div key={course._id} className="relative">
                  {/* Enrolled Badge */}
                  {isEnrolled && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className="shadow-lg bg-green-500 text-white border-2 border-background">
                        ✓ Enrolled
                      </Badge>
                    </div>
                  )}
                  <CourseCard
                    course={course}
                    variant="available"
                    studentId={userId}
                  />
                </div>
              );
            })}
          </StaggerGrid>
        ) : (
          <EmptyState
            icon={Search}
            title="No courses found"
            description={
              searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : "Try adjusting your filters"
            }
          />
        )}
      </div>
    </div>
  );
}
