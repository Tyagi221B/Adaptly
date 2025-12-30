import { getAllInstructors } from "@/actions/admin.actions";
import { InstructorsTable } from "@/components/admin/instructors-table";
import { SearchBar } from "@/components/admin/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default async function InstructorsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const result = await getAllInstructors({ search: params.search });

  if (!result.success) {
    return (
      <div className="text-center">
        <p className="text-red-600">Failed to load instructors</p>
      </div>
    );
  }

  const instructors = result.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Instructors</h2>
          <p className="text-muted-foreground">
            Manage and view all instructor accounts
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2">
          <GraduationCap className="h-5 w-5 text-purple-600" />
          <span className="text-2xl font-bold">{instructors.length}</span>
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
      <InstructorsTable instructors={instructors} />

      {/* Summary Card */}
      {instructors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">
                  {instructors.reduce((sum, i) => sum + i.totalCourses, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Published Courses
                </p>
                <p className="text-2xl font-bold">
                  {instructors.reduce(
                    (sum, i) => sum + i.publishedCourses,
                    0
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">
                  {instructors.reduce((sum, i) => sum + i.totalStudents, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Platform Avg Rating
                </p>
                <p className="text-2xl font-bold">
                  {instructors.length > 0
                    ? (
                        instructors.reduce(
                          (sum, i) => sum + i.averageRating,
                          0
                        ) / instructors.length
                      ).toFixed(1)
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
