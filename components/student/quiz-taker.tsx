"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { submitQuizAttempt } from "@/actions/quiz-attempt.actions";

interface Question {
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  explanation?: string;
}

interface Quiz {
  _id: string;
  questions: Question[];
  passingScore: number;
}

interface QuizTakerProps {
  quiz: Quiz;
  lectureId: string;
  courseId: string;
  studentId: string;
}

export default function QuizTaker({
  quiz,
  lectureId,
  courseId,
  studentId,
}: QuizTakerProps) {
  const router = useRouter();
  const [isStarted, setIsStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartQuiz = () => {
    setIsStarted(true);
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== quiz.questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionIndex, selectedAnswerIndex]) => ({
          questionIndex: parseInt(questionIndex),
          selectedAnswerIndex,
        })
      );

      const result = await submitQuizAttempt(studentId, {
        quizId: quiz._id,
        lectureId,
        courseId,
        answers: formattedAnswers,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to submit quiz");
        setIsSubmitting(false);
        return;
      }

      toast.success("Quiz submitted successfully!");
      // Redirect to results page
      router.push(
        `/student/courses/${courseId}/lectures/${lectureId}/quiz-result/${result.data?.attemptId}`
      );
    } catch {
      toast.error("Failed to submit quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isStarted) {
    return (
      <Button onClick={handleStartQuiz} size="lg" className="w-full">
        Take Quiz
      </Button>
    );
  }

  const allAnswered = Object.keys(answers).length === quiz.questions.length;

  return (
    <div className="space-y-6">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Analyzing Your Answers</h3>
                  <p className="text-sm text-muted-foreground">
                    Calculating your score and generating personalized feedback...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This may take a few seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {quiz.questions.map((question, questionIndex) => (
        <div
          key={questionIndex}
          className="rounded-lg border bg-card p-6 shadow-sm"
        >
          <div className="mb-4">
            <span className="inline-block rounded bg-muted px-2 py-1 text-sm font-medium text-muted-foreground">
              Question {questionIndex + 1}
            </span>
          </div>

          <h3 className="mb-4 text-lg font-medium text-foreground">
            {question.questionText}
          </h3>

          <RadioGroup
            value={answers[questionIndex]?.toString()}
            onValueChange={(value: string) =>
              handleAnswerChange(questionIndex, parseInt(value))
            }
          >
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-background"
                >
                  <RadioGroupItem
                    value={optionIndex.toString()}
                    id={`q${questionIndex}-opt${optionIndex}`}
                  />
                  <Label
                    htmlFor={`q${questionIndex}-opt${optionIndex}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      ))}

      <div className="sticky bottom-4 rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {Object.keys(answers).length} of {quiz.questions.length} questions
            answered
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
