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
import { CreateLectureSchema } from "@/lib/validations";
import type { CreateLectureInput } from "@/lib/validations";
import { createLecture } from "@/actions/lecture.actions";

interface LectureFormProps {
  courseId: string;
  instructorId: string;
  nextOrder: number;
}

export default function LectureForm({
  courseId,
  instructorId,
  nextOrder,
}: LectureFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateLectureInput>({
    resolver: zodResolver(CreateLectureSchema),
    defaultValues: {
      courseId,
      title: "",
      content: "",
      order: nextOrder,
    },
  });

  const contentValue = useWatch({ control, name: "content" });

  const onSubmit = async (data: CreateLectureInput) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await createLecture(instructorId, data);

      if (!result.success) {
        setError(result.error || "Failed to create lecture");
        setIsLoading(false);
        return;
      }

      // Redirect back to course page
      router.push(`/instructor/courses/${courseId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Add New Lecture</CardTitle>
        <CardDescription>
          Create lecture content using markdown formatting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Lecture Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Introduction to Components"
              {...register("title")}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Order Field (Hidden - Auto-generated) */}
          <input type="hidden" {...register("order", { valueAsNumber: true })} />

          {/* Content Field with Preview Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">
                Lecture Content <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Edit" : "Preview"}
              </Button>
            </div>

            {!showPreview ? (
              <>
                <Textarea
                  id="content"
                  placeholder="Write your lecture content using markdown...

# Heading
## Subheading
- Bullet point
**Bold text**
*Italic text*
`code`"
                  rows={20}
                  {...register("content")}
                  disabled={isLoading}
                  className="font-mono text-sm"
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
                <p className="text-sm text-gray-500">
                  Tip: Use markdown syntax for formatting. The preview will show how
                  it will appear to students.
                </p>
              </>
            ) : (
              <div className="min-h-125 rounded-md border bg-white p-6">
                <div className="prose max-w-none">
                  {contentValue ? (
                    <pre className="whitespace-pre-wrap font-sans">
                      {contentValue}
                    </pre>
                  ) : (
                    <p className="text-gray-400">No content to preview</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
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
              {isLoading ? "Creating..." : "Create Lecture"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
