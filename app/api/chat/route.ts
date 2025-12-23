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

    const { messages, lectureContent, lectureTitle } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0 || !lectureContent) {
      return NextResponse.json(
        { success: false, error: "Messages and lecture content are required" },
        { status: 400 }
      );
    }

    const systemMessage = {
      role: "system" as const,
      content: `You are an AI teaching assistant helping a student understand their lecture material.

Lecture Title: ${lectureTitle || "Current Lecture"}

Lecture Content:
${lectureContent}

Please provide clear, concise, and helpful answers based on the lecture content. If questions are outside the scope of the lecture, politely guide the student back to the lecture topics.`,
    };

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemMessage.content,
      messages: messages.map((msg: { role: "user" | "assistant"; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
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
