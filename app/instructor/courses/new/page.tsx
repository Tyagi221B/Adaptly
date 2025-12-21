import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import CourseForm from "@/components/instructor/course-form";
import { Button } from "@/components/ui/button";

export default async function NewCoursePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb/Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/instructor/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Form */}
        <CourseForm instructorId={session.user.id} />
      </div>
    </div>
  );
}
