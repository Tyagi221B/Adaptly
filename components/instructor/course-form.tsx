"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateCourseInput } from "@/lib/validations";
import { createCourse, updateCourse } from "@/actions/course.actions";
import { ImageUpload } from "@/components/instructor/image-upload";

interface CourseFormProps {
  instructorId: string;
  courseId?: string;
  initialData?: {
    title: string;
    description: string;
    category: CreateCourseInput["category"];
    thumbnail?: string;
    instructorMessage?: string;
  };
}

const CATEGORIES = [
  { value: "programming", label: "Programming" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "marketing", label: "Marketing" },
  { value: "data-science", label: "Data Science" },
  { value: "other", label: "Other" },
];

export default function CourseForm({ instructorId, courseId, initialData }: CourseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!courseId && !!initialData;

  const [thumbnailData, setThumbnailData] = useState<{url: string; publicId: string} | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("[FORM] Submitting form...");
      console.log("[FORM] Edit mode:", isEditMode);
      console.log("[FORM] Thumbnail data:", thumbnailData);
      console.log("[FORM] Remove thumbnail:", removeThumbnail);

      const formData = new FormData(e.currentTarget);

      // Add thumbnail URL and publicId if exists
      if (thumbnailData) {
        console.log("[FORM] Appending thumbnail URL and publicId");
        formData.append("thumbnailUrl", thumbnailData.url);
        formData.append("thumbnailPublicId", thumbnailData.publicId);
      }

      // Add remove thumbnail flag
      if (removeThumbnail) {
        console.log("[FORM] Appending remove thumbnail flag");
        formData.append("removeThumbnail", "true");
      }

      // Add instructor ID
      formData.append("instructorId", instructorId);

      // Add course ID for edit mode
      if (isEditMode) {
        formData.append("courseId", courseId!);
      }

      console.log("[FORM] Calling server action...");
      const result = isEditMode
        ? await updateCourse(formData)
        : await createCourse(formData);

      console.log("[FORM] Server action result:", result);

      if (!result.success) {
        setError(result.error || `Failed to ${isEditMode ? "update" : "create"} course`);
        setIsLoading(false);
        return;
      }

      // Redirect to course detail page
      const targetCourseId = isEditMode ? courseId : result.data?.courseId;
      console.log("[FORM] Redirecting to:", `/instructor/courses/${targetCourseId}`);
      router.push(`/instructor/courses/${targetCourseId}`);
    } catch (err) {
      console.error("[FORM] Submission error:", err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Course" : "Create New Course"}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update the course details below"
            : "Fill in the details below to create a new course"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Course Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Introduction to React"
              defaultValue={initialData?.title}
              disabled={isLoading}
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Course Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what students will learn in this course..."
              rows={4}
              defaultValue={initialData?.description}
              disabled={isLoading}
              required
              minLength={10}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              name="category"
              defaultValue={initialData?.category || "programming"}
              disabled={isLoading}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Course Thumbnail</Label>
            <ImageUpload
              value={initialData?.thumbnail}
              onChange={(result) => {
                setThumbnailData(result);
                setRemoveThumbnail(false);
              }}
              onRemove={() => {
                setThumbnailData(null);
                setRemoveThumbnail(true);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructorMessage">
              Message from Instructor (Optional)
            </Label>
            <Textarea
              id="instructorMessage"
              name="instructorMessage"
              placeholder="Write a personal message to students about this course..."
              rows={4}
              defaultValue={initialData?.instructorMessage}
              disabled={isLoading}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              This message will be displayed on the course detail page
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Course" : "Create Course"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
