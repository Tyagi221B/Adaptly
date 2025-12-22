"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { CreateCourseSchema } from "@/lib/validations";
import type { CreateCourseInput } from "@/lib/validations";
import { createCourse, updateCourse } from "@/actions/course.actions";

interface CourseFormProps {
  instructorId: string;
  courseId?: string;
  initialData?: {
    title: string;
    description: string;
    category: CreateCourseInput["category"];
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(CreateCourseSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      category: "programming",
    },
  });

  const selectedCategory = useWatch({ control, name: "category" });

  const onSubmit = async (data: CreateCourseInput) => {
    setIsLoading(true);
    setError("");

    try {
      const result = isEditMode
        ? await updateCourse(courseId!, instructorId, data)
        : await createCourse(instructorId, data);

      if (!result.success) {
        setError(result.error || `Failed to ${isEditMode ? "update" : "create"} course`);
        setIsLoading(false);
        return;
      }

      // Redirect to course detail page
      const targetCourseId = isEditMode ? courseId : result.data?.courseId;
      router.push(`/instructor/courses/${targetCourseId}`);
    } catch {
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Course Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Introduction to React"
              {...register("title")}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Course Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this course..."
              rows={4}
              {...register("description")}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) =>
                setValue("category", value as CreateCourseInput["category"])
              }
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
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
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
