"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, BookOpen, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { deleteCourse } from "@/actions/course.actions";
import { useSession } from "next-auth/react";

interface CourseCardProps {
  course: {
    _id: string;
    title: string;
    description: string;
    category: string;
    isPublished: boolean;
    lectureCount: number;
    createdAt: Date;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      return;
    }

    if (!session?.user?.id) {
      alert("You must be logged in to delete a course");
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteCourse(course._id, session.user.id);

      if (result.success) {
        router.refresh(); // Refresh the page to show updated course list
      } else {
        alert(result.error || "Failed to delete course");
      }
    } catch {
      alert("Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryColors: Record<string, string> = {
    programming: "bg-blue-100 text-blue-800",
    design: "bg-purple-100 text-purple-800",
    business: "bg-green-100 text-green-800",
    marketing: "bg-orange-100 text-orange-800",
    "data-science": "bg-pink-100 text-pink-800",
    other: "bg-muted text-foreground",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{course.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-2">
              {course.description}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/instructor/courses/${course._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={categoryColors[course.category] || categoryColors.other}
          >
            {course.category.replace("-", " ")}
          </Badge>

          {course.isPublished ? (
            <Badge variant="default">Published</Badge>
          ) : (
            <Badge variant="outline">Draft</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <BookOpen className="mr-1 h-4 w-4" />
          {course.lectureCount} {course.lectureCount === 1 ? "lecture" : "lectures"}
        </div>

        <Button asChild>
          <Link href={`/instructor/courses/${course._id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
