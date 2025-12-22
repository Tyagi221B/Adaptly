"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/instructor/rich-text-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateLectureSchema } from "@/lib/validations";
import type { CreateLectureInput } from "@/lib/validations";
import { createLecture, updateLecture } from "@/actions/lecture.actions";

interface LectureFormProps {
  courseId: string;
  instructorId: string;
  nextOrder?: number;
  lectureId?: string;
  initialData?: {
    title: string;
    content: string;
    order: number;
  };
}

export default function LectureForm({
  courseId,
  instructorId,
  nextOrder = 1,
  lectureId,
  initialData,
}: LectureFormProps) {
  const isEditMode = !!lectureId && !!initialData;
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<CreateLectureInput>({
    resolver: zodResolver(CreateLectureSchema),
    defaultValues: initialData
      ? {
          courseId,
          title: initialData.title,
          content: initialData.content,
          order: initialData.order,
        }
      : {
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
      const result = isEditMode
        ? await updateLecture(lectureId!, instructorId, data)
        : await createLecture(instructorId, data);

      if (!result.success) {
        setError(result.error || `Failed to ${isEditMode ? "update" : "create"} lecture`);
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
        <CardTitle>{isEditMode ? "Edit Lecture" : "Add New Lecture"}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update the lecture content below"
            : "Create lecture content using markdown formatting"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <input type="hidden" {...register("order", { valueAsNumber: true })} />

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
                <RichTextEditor
                  value={contentValue || ""}
                  onChange={(markdown) => setValue("content", markdown, { shouldValidate: true })}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
              </>
            ) : (
              <div className="min-h-125 rounded-md border bg-card p-6">
                <div className="prose prose-slate max-w-none">
                  {contentValue ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {contentValue}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground">No content to preview</p>
                  )}
                </div>
              </div>
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
                isEditMode ? "Update Lecture" : "Create Lecture"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
