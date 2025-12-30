import { getAllStudents } from "@/actions/admin.actions";
import { StudentsTable } from "@/components/admin/students-table";
import { SearchBar } from "@/components/admin/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const result = await getAllStudents({ search: params.search });

  if (!result.success) {
    return (
      <div className="text-center">
        <p className="text-red-600">Failed to load students</p>
      </div>
    );
  }

  const students = result.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage and view all student accounts
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-2xl font-bold">{students.length}</span>
          <span className="text-sm text-muted-foreground">total</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBar />
        </div>
      </div>

      {/* Table */}
      <StudentsTable students={students} />

      {/* Summary Card */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Enrollments
                </p>
                <p className="text-2xl font-bold">
                  {students.reduce(
                    (sum, s) => sum + s.enrollmentCount,
                    0
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Quizzes Passed
                </p>
                <p className="text-2xl font-bold">
                  {students.reduce(
                    (sum, s) => sum + s.quizzesPassedCount,
                    0
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Platform Avg Score
                </p>
                <p className="text-2xl font-bold">
                  {students.length > 0
                    ? Math.round(
                        students.reduce((sum, s) => sum + s.averageScore, 0) /
                          students.length
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
