import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth-config";
import { getAllInstructorStudents } from "@/actions/instructor.actions";
import { Button } from "@/components/ui/button";
import EnrolledStudentsTable from "@/components/instructor/enrolled-students-table";

export default async function AllStudentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get all students across all instructor's courses
  const studentsResult = await getAllInstructorStudents(session.user.id);

  const students = studentsResult.success ? studentsResult.data : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/instructor/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            All My Students
          </h1>
          <p className="text-muted-foreground">
            {students.length} student{students.length !== 1 ? "s" : ""} enrolled
            across all your courses
          </p>
        </div>

        {/* Students Table - Pass null as courseId to indicate it's all-students view */}
        <EnrolledStudentsTable
          students={students}
          courseId={null as unknown as string}
          isAllStudentsView={true}
        />
      </div>
    </div>
  );
}
