import { z } from "zod";

// Sign Up Schema
export const SignUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .transform((val) => val.trim()),
  email: z
    .email("Please provide a valid email address")
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "instructor"]),
});

// Sign In Schema
export const SignInSchema = z.object({
  email: z
    .email("Please provide a valid email address")
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

// Type inference
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;

// ========================================
// COURSE SCHEMAS
// ========================================

const courseCategories = [
  "programming",
  "design",
  "business",
  "marketing",
  "data-science",
  "other",
] as const;

export const CreateCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .transform((val) => val.trim()),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .transform((val) => val.trim()),
  category: z.enum(courseCategories),
  thumbnail: z.string().optional(),
  thumbnailPublicId: z.string().optional(),
  instructorMessage: z
    .string()
    .max(2000, "Instructor message cannot exceed 2000 characters")
    .optional(),
});

export const UpdateCourseSchema = CreateCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;

// ========================================
// LECTURE SCHEMAS
// ========================================

export const CreateLectureSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters")
    .transform((val) => val.trim()),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .transform((val) => val.trim()),
  order: z.number().int().min(1, "Order must be at least 1"),
});

export const UpdateLectureSchema = CreateLectureSchema.partial().omit({
  courseId: true,
});

export type CreateLectureInput = z.infer<typeof CreateLectureSchema>;
export type UpdateLectureInput = z.infer<typeof UpdateLectureSchema>;

// ========================================
// QUIZ SCHEMAS
// ========================================

export const QuestionSchema = z.object({
  questionText: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .transform((val) => val.trim()),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .length(4, "Must have exactly 4 options"),
  correctAnswerIndex: z
    .number()
    .int()
    .min(0, "Index must be between 0 and 3")
    .max(3, "Index must be between 0 and 3"),
  explanation: z.string().optional(),
});

export const SaveQuizSchema = z.object({
  lectureId: z.string().min(1, "Lecture ID is required"),
  questions: z
    .array(QuestionSchema)
    .min(3, "Quiz must have at least 3 questions")
    .max(15, "Quiz cannot have more than 15 questions"),
  passingScore: z
    .number()
    .int()
    .min(0, "Passing score must be between 0 and 100")
    .max(100, "Passing score must be between 0 and 100")
    .default(70),
});

export type QuestionInput = z.infer<typeof QuestionSchema>;
export type SaveQuizInput = z.infer<typeof SaveQuizSchema>;
