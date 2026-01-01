import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { StatsCards } from "./components/stats-cards";
import { EnrolledCourses } from "./components/enrolled-courses";
import { AvailableCourses } from "./components/available-courses";
import { StatsLoader, EnrolledCoursesLoader, AvailableCoursesLoader } from "./components/loaders";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="container mx-auto py-8 px-4">
      {/* STATIC SHELL - Prerendered at build time */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {session.user.name || "Student"}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* DYNAMIC SECTION 1 - Streams independently 🌊 */}
      <Suspense fallback={<StatsLoader />}>
        <StatsCards />
      </Suspense>

      {/* DYNAMIC SECTION 2 - Streams independently 🌊 */}
      <Suspense fallback={<EnrolledCoursesLoader />}>
        <EnrolledCourses />
      </Suspense>

      {/* Divider - Static */}
      <div className="mb-12 border-t" />

      {/* DYNAMIC SECTION 3 - Streams independently 🌊 */}
      <Suspense fallback={<AvailableCoursesLoader />}>
        <AvailableCourses />
      </Suspense>
    </main>
  );
}
