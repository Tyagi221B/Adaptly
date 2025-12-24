"use client";

import { useState, useMemo } from "react";
import { Search, Sparkles, TrendingUp, Zap } from "lucide-react";
import { CourseCard } from "@/components/shared/course-card";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilter } from "@/components/shared/category-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { StaggerGrid } from "@/components/ui/stagger-grid";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-background border-b">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="px-4 py-2 text-sm font-medium" variant="secondary">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                {totalCount} Courses Available
              </Badge>
            </motion.div>

            {/* Main Headline - Sexy Font */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight"
            >
              <span className="block">Stop doom-scrolling</span>
              <span className="block bg-linear-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                tutorials.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl font-bold text-foreground/80"
            >
              Start actually learning stuff.
            </motion.p>

            {/* Stats Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">
                  {enrolledCount} enrolled
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border">
                <Search className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">
                  {totalCount - enrolledCount} to explore
                </span>
              </div>
            </motion.div>

            {/* Large Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-8 max-w-2xl mx-auto"
            >
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Search by title, topic, or instructor..."
                className="h-14 text-lg shadow-lg"
              />
            </motion.div>
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
