"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markLectureComplete } from "@/actions/enrollment.actions";
import { useSidebar } from "./lecture-layout-wrapper";

interface MarkCompleteButtonProps {
  studentId: string;
  courseId: string;
  lectureId: string;
  isCompleted: boolean;
  nextLectureId?: string;
}

export default function MarkCompleteButton({
  studentId,
  courseId,
  lectureId,
  isCompleted,
  nextLectureId,
}: MarkCompleteButtonProps) {
  const router = useRouter();
  const [isMarking, setIsMarking] = useState(false);
  const { closeSidebar } = useSidebar();

  const handleMarkComplete = async (goToNext: boolean = false) => {
    setIsMarking(true);

    try {
      const result = await markLectureComplete(studentId, courseId, lectureId);

      if (!result.success) {
        toast.error(result.error || "Failed to mark lecture as complete");
        setIsMarking(false);
        return;
      }

      toast.success("Lecture marked as complete!");

      if (goToNext && nextLectureId) {
        router.push(`/student/courses/${courseId}/lectures/${nextLectureId}`);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Failed to mark lecture as complete. Please try again.");
      setIsMarking(false);
    }
  };

  if (isCompleted) {
    if (nextLectureId) {
      return (
        <div className="flex gap-3">
          <Button disabled variant="outline" size="lg" className="flex-1">
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
            Completed
          </Button>
          <Button asChild size="lg" className="flex-1">
            <Link
              href={`/student/courses/${courseId}/lectures/${nextLectureId}`}
              onClick={closeSidebar}
            >
              Next Lecture
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      );
    }
    return (
      <Button disabled variant="outline" size="lg" className="w-full">
        <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
        Completed
      </Button>
    );
  }

  if (nextLectureId) {
    return (
      <div className="flex gap-3">
        <Button
          onClick={() => handleMarkComplete(false)}
          disabled={isMarking}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          {isMarking ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Marking...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Mark Complete
            </>
          )}
        </Button>
        <Button
          onClick={() => handleMarkComplete(true)}
          disabled={isMarking}
          size="lg"
          className="flex-1"
        >
          {isMarking ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Next...
            </>
          ) : (
            <>
              Complete & Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => handleMarkComplete(false)}
      disabled={isMarking}
      size="lg"
      className="w-full"
    >
      {isMarking ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Marking Complete...
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Mark as Complete
        </>
      )}
    </Button>
  );
}
