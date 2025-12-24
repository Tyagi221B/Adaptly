"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatAssistantProps {
  lectureContent: string;
  lectureTitle: string;
  lectureId: string;
  mode?: "sidebar" | "floating";
}

export default function AIChatAssistant({
  lectureContent,
  lectureTitle,
  lectureId,
  mode = "floating",
}: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load saved collapsed state from localStorage
  useEffect(() => {
    if (mode === "sidebar") {
      const saved = localStorage.getItem("ai-sidebar-collapsed");
      setIsCollapsed(saved === "true");
    }
  }, [mode]);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    if (mode === "sidebar") {
      localStorage.setItem("ai-sidebar-collapsed", String(isCollapsed));
    }
  }, [isCollapsed, mode]);

  // Load messages from localStorage for this lecture
  useEffect(() => {
    const storageKey = `ai-chat-messages-${lectureId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
      }
    } else {
      setMessages([]);
    }
  }, [lectureId]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = `ai-chat-messages-${lectureId}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, lectureId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          lectureContent,
          lectureTitle,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    const storageKey = `ai-chat-messages-${lectureId}`;
    localStorage.removeItem(storageKey);
    setMessages([]);
    toast.success("Chat cleared");
  };

  // Sidebar Mode (Desktop)
  if (mode === "sidebar") {
    if (isCollapsed) {
      // Collapsed state - show expand button
      return (
        <div className="sticky top-0 h-fit">
          <Button
            onClick={() => setIsCollapsed(false)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 shadow-md"
          >
            <ChevronLeft className="h-4 w-4" />
            <Sparkles className="h-4 w-4 text-primary" />
            AI Assistant
          </Button>
        </div>
      );
    }

    // Expanded state - show full sidebar (VS Code-like)
    return (
      <div className="sticky top-4 h-[calc(100vh-8rem)] flex flex-col border-l bg-background">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="h-8 w-8 p-0 hover:bg-muted"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8 p-0 hover:bg-muted"
              title="Collapse sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center pt-12 space-y-4">
                  <Sparkles className="h-12 w-12 text-muted-foreground animate-pulse" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Hi! I'm your AI tutor
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ask me anything about this lecture
                    </p>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground text-left w-full max-w-xs">
                    <p className="font-medium">Try asking:</p>
                    <ul className="space-y-1 pl-4">
                      <li>• "Explain this simply"</li>
                      <li>• "What are the key points?"</li>
                      <li>• "Give me an example"</li>
                    </ul>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[85%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-2 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="shrink-0 px-4 py-3 border-t bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Floating Mode (Mobile)
  return (
    <>
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Assistant
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="h-8 w-8 p-0"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-96 pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Ask me anything about this lecture!
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[85%] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
      </Button>
    </>
  );
}
