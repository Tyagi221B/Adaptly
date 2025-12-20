import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

export interface GeneratedQuestion {
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  explanation?: string;
}

export async function generateQuizQuestions(
  lectureContent: string,
  questionCount: number = 5
): Promise<GeneratedQuestion[]> {
  try {
    const prompt = `You are an expert educator creating multiple-choice questions to test understanding of a lecture.

LECTURE CONTENT:
${lectureContent}

INSTRUCTIONS:
- Generate exactly ${questionCount} multiple-choice questions based on the lecture content
- Each question should test understanding of key concepts
- Provide exactly 4 options for each question
- Indicate which option is correct (0-3 index)
- Add a brief explanation for the correct answer
- Questions should range from basic recall to application of concepts
- Avoid trick questions - make them fair and educational

OUTPUT FORMAT (JSON):
Return a JSON array of questions with this exact structure:
[
  {
    "questionText": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "This is correct because..."
  }
]

IMPORTANT:
- Return ONLY valid JSON, no additional text
- Ensure exactly 4 options per question
- correctAnswerIndex must be 0, 1, 2, or 3
- All questions must be relevant to the lecture content`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.7,
    });

    // Extract JSON from response (in case AI adds extra text)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response - no JSON array found");
    }

    const questions = JSON.parse(jsonMatch[0]) as GeneratedQuestion[];

    // Validate the response
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI returned invalid question format");
    }

    // Validate each question
    for (const question of questions) {
      if (
        !question.questionText ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        typeof question.correctAnswerIndex !== "number" ||
        question.correctAnswerIndex < 0 ||
        question.correctAnswerIndex > 3
      ) {
        throw new Error("AI returned invalid question structure");
      }
    }

    return questions;
  } catch (error) {
    console.error("AI Quiz Generation Error:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to generate quiz: ${error.message}`
        : "Failed to generate quiz"
    );
  }
}

// Helper function to regenerate a single question
export async function regenerateSingleQuestion(
  lectureContent: string,
  existingQuestions: string[]
): Promise<GeneratedQuestion> {
  try {
    const prompt = `You are an expert educator creating a multiple-choice question to test understanding of a lecture.

LECTURE CONTENT:
${lectureContent}

EXISTING QUESTIONS (do NOT duplicate these):
${existingQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

INSTRUCTIONS:
- Generate 1 NEW multiple-choice question that is different from existing ones
- Test understanding of a key concept from the lecture
- Provide exactly 4 options
- Indicate which option is correct (0-3 index)
- Add a brief explanation

OUTPUT FORMAT (JSON):
{
  "questionText": "What is...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswerIndex": 0,
  "explanation": "This is correct because..."
}

Return ONLY valid JSON, no additional text.`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.8,
    });

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const question = JSON.parse(jsonMatch[0]) as GeneratedQuestion;

    // Validate
    if (
      !question.questionText ||
      !Array.isArray(question.options) ||
      question.options.length !== 4 ||
      typeof question.correctAnswerIndex !== "number" ||
      question.correctAnswerIndex < 0 ||
      question.correctAnswerIndex > 3
    ) {
      throw new Error("AI returned invalid question structure");
    }

    return question;
  } catch (error) {
    console.error("AI Question Regeneration Error:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to regenerate question: ${error.message}`
        : "Failed to regenerate question"
    );
  }
}
