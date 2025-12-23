"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Plus, Trash2, Save, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { generateQuizFromLecture, saveQuiz } from "@/actions/quiz.actions";

interface Question {
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  explanation?: string;
}

interface QuizGeneratorProps {
  lectureId: string;
  instructorId: string;
  existingQuiz: {
    questions: Question[];
    passingScore: number;
  } | null;
}

export default function QuizGenerator({
  lectureId,
  instructorId,
  existingQuiz,
}: QuizGeneratorProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(
    existingQuiz?.questions || []
  );
  const [passingScore, setPassingScore] = useState(
    existingQuiz?.passingScore || 70
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const result = await generateQuizFromLecture(lectureId, instructorId, 5);

      if (!result.success) {
        setError(result.error || "Failed to generate quiz");
        setIsGenerating(false);
        return;
      }

      setQuestions(result.data?.questions || []);
      setIsGenerating(false);
    } catch {
      setError("Failed to generate quiz. Please try again.");
      setIsGenerating(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (questions.length < 3) {
      setError("Quiz must have at least 3 questions");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const result = await saveQuiz(instructorId, {
        lectureId,
        questions,
        passingScore,
      });

      if (!result.success) {
        setError(result.error || "Failed to save quiz");
        setIsSaving(false);
        return;
      }

      toast.success("Quiz saved successfully!");
      router.refresh();
      setIsSaving(false);
    } catch {
      setError("Failed to save quiz. Please try again.");
      setIsSaving(false);
    }
  };

  const updateQuestion = (
    index: number,
    field: keyof Question,
    value: string | number
  ) => {
    const updated = [...questions];
    if (field === "correctAnswerIndex") {
      updated[index].correctAnswerIndex = value as number;
    } else if (field === "questionText") {
      updated[index].questionText = value as string;
    } else if (field === "explanation") {
      updated[index].explanation = value as string;
    }
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Generating Quiz with AI</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzing lecture content and creating questions...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This may take 5-10 seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {questions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Generate Quiz with AI</CardTitle>
            <CardDescription>
              Use AI to automatically create quiz questions from your lecture content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Quiz
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Quiz Questions</h2>
            <p className="text-muted-foreground">
              Edit questions or generate new ones with AI
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
            <Button onClick={addQuestion} variant="outline" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
            <Button onClick={handleSaveQuiz} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Quiz
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Passing Score</CardTitle>
            <CardDescription>
              Minimum percentage required to pass this quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {questions.map((question, qIndex) => (
          <Card key={qIndex}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge variant="secondary">Question {qIndex + 1}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  value={question.questionText}
                  onChange={(e) =>
                    updateQuestion(qIndex, "questionText", e.target.value)
                  }
                  rows={2}
                  placeholder="Enter question text..."
                />
              </div>

              <div className="space-y-3">
                <Label>Options (select the correct answer)</Label>
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={question.correctAnswerIndex === optIndex}
                      onChange={() =>
                        updateQuestion(qIndex, "correctAnswerIndex", optIndex)
                      }
                      className="h-4 w-4"
                    />
                    <Input
                      value={option}
                      onChange={(e) =>
                        updateOption(qIndex, optIndex, e.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Explanation (Optional)</Label>
                <Textarea
                  value={question.explanation || ""}
                  onChange={(e) =>
                    updateQuestion(qIndex, "explanation", e.target.value)
                  }
                  rows={2}
                  placeholder="Explain why this is the correct answer..."
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
