"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./lecture-layout-wrapper";

interface NextLectureButtonProps {
  courseId: string;
  lectureId: string;
  className?: string;
}

export function NextLectureButton({ courseId, lectureId, className }: NextLectureButtonProps) {
  const { closeSidebar } = useSidebar();

  return (
    <Button asChild className={className}>
      <Link
        href={`/student/courses/${courseId}/lectures/${lectureId}`}
        onClick={closeSidebar}
      >
        Next Lecture
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
