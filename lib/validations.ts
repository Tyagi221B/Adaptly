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
