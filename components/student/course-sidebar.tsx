"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle, FileText, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Lecture {
  _id: string;
  title: string;
  order: number;
}

interface CourseSidebarProps {
  courseId: string;
  courseTitle: string;
  lectures: Lecture[];
  completedLectureIds: string[];
}

export function CourseSidebar({
  courseId,
  courseTitle,
  lectures,
  completedLectureIds,
}: CourseSidebarProps) {
  const pathname = usePathname();

  // Sort lectures by order
  const sortedLectures = [...lectures].sort((a, b) => a.order - b.order);

  // Calculate progress
  const totalLectures = sortedLectures.length;
  const completedCount = completedLectureIds.length;
  const progressPercentage = totalLectures > 0
    ? Math.round((completedCount / totalLectures) * 100)
    : 0;

  const isLectureCompleted = (lectureId: string) => {
    return completedLectureIds.includes(lectureId);
  };

  const isLectureActive = (lectureId: string) => {
    return pathname.includes(lectureId);
  };

  return (
    <aside className="w-72 border-r bg-card h-full overflow-y-auto">
      <div className="p-4 border-b space-y-4">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2">{courseTitle}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount} of {totalLectures} completed
          </p>
        </div>

        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {progressPercentage}% Complete
          </p>
        </div>

        {progressPercentage === 100 && (
          <Badge variant="secondary" className="w-full justify-center gap-1">
            <Award className="h-3 w-3" />
            Course Completed!
          </Badge>
        )}
      </div>

      <nav className="p-2">
        <div className="space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Course Content
          </p>

          {sortedLectures.map((lecture, index) => {
            const isCompleted = isLectureCompleted(lecture._id);
            const isActive = isLectureActive(lecture._id);

            return (
              <Link
                key={lecture._id}
                href={`/student/courses/${courseId}/lectures/${lecture._id}`}
                className={cn(
                  "flex items-start gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary/10 text-primary font-medium",
                  !isActive && "text-muted-foreground"
                )}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      Lecture {index + 1}
                    </span>
                  </div>
                  <p className={cn(
                    "mt-0.5 line-clamp-2",
                    isActive && "font-semibold"
                  )}>
                    {lecture.title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
