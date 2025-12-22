"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleCoursePublish } from "@/actions/course.actions";

interface PublishToggleProps {
  courseId: string;
  instructorId: string;
  isPublished: boolean;
}

export default function PublishToggle({
  courseId,
  instructorId,
  isPublished,
}: PublishToggleProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (
      isPublished &&
      !confirm(
        "Are you sure you want to unpublish this course? Students will no longer be able to see or enroll in it."
      )
    ) {
      return;
    }

    setIsToggling(true);

    try {
      const result = await toggleCoursePublish(courseId, instructorId);

      if (!result.success) {
        toast.error(result.error || "Failed to update course status");
        setIsToggling(false);
        return;
      }

      toast.success(
        isPublished
          ? "Course unpublished successfully"
          : "Course published successfully"
      );
      // Refresh to show updated status
      router.refresh();
    } catch {
      toast.error("Failed to update course status. Please try again.");
      setIsToggling(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isToggling}
      variant={isPublished ? "outline" : "default"}
      className="gap-2"
    >
      {isToggling ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {isPublished ? "Unpublishing..." : "Publishing..."}
        </>
      ) : isPublished ? (
        <>
          <Lock className="h-4 w-4" />
          Unpublish Course
        </>
      ) : (
        <>
          <Globe className="h-4 w-4" />
          Publish Course
        </>
      )}
    </Button>
  );
}
