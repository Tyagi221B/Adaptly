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

// Generate personalized remedial content based on wrong answers
export interface WrongAnswer {
  questionText: string;
  correctAnswer: string;
  studentAnswer: string;
  explanation?: string;
}

export async function generateRemedialContent(
  lectureContent: string,
  wrongAnswers: WrongAnswer[]
): Promise<string> {
  try {
    if (wrongAnswers.length === 0) {
      return "Great job! You got all questions correct. No remedial content needed.";
    }

    const prompt = `You are a patient, supportive AI tutor helping a student who struggled with some quiz questions. Your goal is to help them truly understand the concepts they missed.

LECTURE CONTENT:
${lectureContent}

QUESTIONS THE STUDENT GOT WRONG:
${wrongAnswers
  .map(
    (qa, i) => `
${i + 1}. Question: ${qa.questionText}
   Student's Answer: ${qa.studentAnswer}
   Correct Answer: ${qa.correctAnswer}
   ${qa.explanation ? `Explanation: ${qa.explanation}` : ""}`
  )
  .join("\n")}

INSTRUCTIONS:
Create personalized remedial content that:
1. Identifies the core concepts the student misunderstood
2. Explains these concepts clearly using examples and analogies
3. Shows WHY the correct answers are right (not just WHAT they are)
4. Connects the concepts back to the lecture material
5. Provides practical tips to remember these concepts
6. Uses a warm, encouraging tone - mistakes are learning opportunities!

FORMAT:
- Use markdown formatting (headings, bold, lists, code blocks if needed)
- Start with a brief, encouraging message
- Organize content by concept (not by question)
- Include concrete examples
- End with a summary of key takeaways
- Keep it concise but thorough (aim for 300-500 words)

Write the remedial content now:`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.7,
    });

    return text.trim();
  } catch (error) {
    console.error("AI Remedial Content Generation Error:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to generate remedial content: ${error.message}`
        : "Failed to generate remedial content"
    );
  }
}
