"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { regenerateRemedialContentForTesting } from "@/actions/quiz-attempt.actions";
import { toast } from "sonner";

interface RemedialContentCardProps {
  initialContent: string;
  attemptId: string;
  studentId: string;
  isDev?: boolean;
}

export function RemedialContentCard({
  initialContent,
  attemptId,
  studentId,
  isDev = false,
}: RemedialContentCardProps) {
  const [content, setContent] = useState(initialContent);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);

    const result = await regenerateRemedialContentForTesting(studentId, attemptId);

    if (result.success && result.data) {
      setContent(result.data.content);
      toast.success("Content regenerated!");
    } else {
      toast.error(result.error || "Failed to regenerate");
    }

    setIsRegenerating(false);
  };

  return (
    <Card className="mb-8 border-l-4 border-l-blue-500 bg-linear-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              Your Personalized Learning Path
            </CardTitle>
            <CardDescription>
              Let&apos;s turn these mistakes into mastery
            </CardDescription>
          </div>

          {/* Dev-only regenerate button */}
          {isDev && (
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
              {isRegenerating ? "Regenerating..." : "Regenerate (Dev)"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="remedial-content prose prose-slate dark:prose-invert max-w-none prose-p:text-muted-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:text-foreground prose-code:rounded prose-code:px-1 prose-code:py-0.5">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
