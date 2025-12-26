"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [showDialog, setShowDialog] = useState(false);

  const handleToggleClick = () => {
    if (isPublished) {
      // Show confirmation dialog for unpublishing
      setShowDialog(true);
    } else {
      // Publish directly without confirmation
      handleToggle();
    }
  };

  const handleToggle = async () => {
    setShowDialog(false);
    setIsToggling(true);

    try {
      const result = await toggleCoursePublish(courseId, instructorId);

      if (!result.success) {
        toast.error(result.error || "Failed to update course status");
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
    } finally {
      // Always reset loading state, whether success or error
      setIsToggling(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleToggleClick}
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

      {/* Unpublish Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Course?</AlertDialogTitle>
            <AlertDialogDescription>
              Students will no longer be able to see or enroll in this course.
              You can republish it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Unpublish Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
