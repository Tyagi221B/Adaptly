import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { Button } from "@/components/ui/button";
import { InstructorCourses } from "./components/instructor-courses";
import { InstructorStats } from "./components/instructor-stats";
import { CoursesLoader, StatsLoader } from "./components/loaders";

export default async function InstructorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="container mx-auto py-8 px-4">
      {/* STATIC SHELL - Prerendered */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {session.user.name}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your courses and track student progress
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild size="lg" variant="outline" className="w-full md:w-auto">
            <Link href="/instructor/students">
              <Users className="mr-2 h-5 w-5" />
              View All Students
            </Link>
          </Button>
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link href="/instructor/courses/new">
              <Plus className="mr-2 h-5 w-5" />
              Create Course
            </Link>
          </Button>
        </div>
      </div>

      {/* DYNAMIC - Courses Stream */}
      <Suspense fallback={<CoursesLoader />}>
        <InstructorCourses />
      </Suspense>

      {/* DYNAMIC - Stats Stream */}
      <Suspense fallback={<StatsLoader />}>
        <InstructorStats />
      </Suspense>
    </main>
  );
}
