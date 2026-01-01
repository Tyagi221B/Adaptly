import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function CoursesLoader() {
  return (
    <div className="mb-8">
      <Skeleton className="mb-4 h-8 w-48" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StatsLoader() {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-10 w-16" />
        </div>
      ))}
    </div>
  );
}
