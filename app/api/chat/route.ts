import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { question, lectureContent, lectureTitle } = await req.json();

    if (!question || !lectureContent) {
      return NextResponse.json(
        { success: false, error: "Question and lecture content are required" },
        { status: 400 }
      );
    }

    const prompt = `You are an AI teaching assistant helping a student understand their lecture material.

Lecture Title: ${lectureTitle || "Current Lecture"}

Lecture Content:
${lectureContent}

Student Question: ${question}

Please provide a clear, concise, and helpful answer based on the lecture content. If the question is outside the scope of the lecture, politely guide the student back to the lecture topics.`;

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: prompt,
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      data: {
        answer: result.text.trim(),
      },
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate response"
      },
      { status: 500 }
    );
  }
}
