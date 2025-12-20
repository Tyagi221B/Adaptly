"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createCourse } from "@/actions/course.actions";

interface CourseFormProps {
  instructorId: string;
}

const CATEGORIES = [
  { value: "programming", label: "Programming" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "marketing", label: "Marketing" },
  { value: "data-science", label: "Data Science" },
  { value: "other", label: "Other" },
];

export default function CourseForm({ instructorId }: CourseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(CreateCourseSchema),
    defaultValues: {
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
      const result = await createCourse(instructorId, data);

      if (!result.success) {
        setError(result.error || "Failed to create course");
        setIsLoading(false);
        return;
      }

      // Redirect to course detail page
      router.push(`/instructor/courses/${result.data?.courseId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
        <CardDescription>
          Fill in the details below to create a new course
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
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

          {/* Description Field */}
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

          {/* Category Field */}
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

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Submit Button */}
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
              {isLoading ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
