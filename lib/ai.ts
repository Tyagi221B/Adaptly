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

    const prompt = `You are a patient, friendly tutor helping a student understand their mistakes. Think step-by-step and explain like you're talking to a curious friend.

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

STEP 1 - ANALYZE FIRST (Think internally. Do not show your reasoning):
Before writing your response, think deeply:
- What core concepts did the student struggle with?
- Can I group multiple questions under the same concept?
- What real-world analogies would make this click?
- What's the simplest way to explain this?

STEP 2 - WRITE YOUR RESPONSE (this is what the student sees):
Follow this structure (use markdown):

## [Core Concept Name]
*Related to: Question #X, #Y*

[Explain what went wrong in conversational language - like you're chatting with a friend over coffee]

### Think of It Like This
[REQUIRED: Include a real-world analogy from everyday life - NOT tech jargon. Make it relatable and memorable]

### Let Me Show You
\`\`\`
[Include a code example or practical demonstration if relevant]
\`\`\`

### Key Takeaway
[One simple sentence they can remember]

---

(Repeat for each concept)

---

## You've Got This!
[End with genuine encouragement and next steps]

IMPORTANT RULES:
- Be conversational and warm - talk like a human, not a textbook
- Group by underlying concepts, not individual questions
- MUST include real-world analogies for each concept
- Reference which question numbers relate to each concept
- Use emojis sparingly (only section headers)
- Keep explanations clear and concise
- Focus on WHY, not just WHAT
- Make it feel like a supportive conversation

FORMATTING RULES (IMPORTANT):
- Always insert a blank line between paragraphs
- Use TWO line breaks between major sections (headings)
- Never place text immediately under a heading without a blank line
- Code blocks must be surrounded by blank lines
- Do not compress paragraphs
- Optimize for comfortable reading, not compactness

Now write your response following this exact structure:`;

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
