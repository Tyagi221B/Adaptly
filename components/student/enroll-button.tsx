"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { enrollInCourse } from "@/actions/enrollment.actions";

interface EnrollButtonProps {
  courseId: string;
  studentId: string;
}

export default function EnrollButton({ courseId, studentId }: EnrollButtonProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);

    try {
      const result = await enrollInCourse(studentId, courseId);

      if (!result.success) {
        alert(result.error || "Failed to enroll in course");
        setIsEnrolling(false);
        return;
      }

      // Refresh the page to show enrolled state
      router.refresh();
    } catch {
      alert("Failed to enroll in course. Please try again.");
      setIsEnrolling(false);
    }
  };

  return (
    <Button
      onClick={handleEnroll}
      disabled={isEnrolling}
      size="lg"
      className="mt-4"
    >
      {isEnrolling ? "Enrolling..." : "Enroll in Course"}
    </Button>
  );
}
