"use server";

import { ZodError } from "zod";
import dbConnect from "@/lib/mongodb";
import User from "@/database/user.model";
import { SignUpSchema, SignUpInput } from "@/lib/validations";

export async function signUpWithCredentials(data: SignUpInput) {
  try {
    // Validate input
    const validatedData = SignUpSchema.parse(data);

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Create new user (password will be hashed by pre-save hook)
    const newUser = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      role: validatedData.role,
    });

    if (!newUser) {
      return {
        success: false,
        error: "Failed to create user",
      };
    }

    // Return success
    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    // Handle MongoDB duplicate key error
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return {
        success: false,
        error: "Email already exists",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
