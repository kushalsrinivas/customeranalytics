"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import { BotIcon, UserIcon, Sparkles } from "lucide-react";

type AiInsightSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  staticPoints?: string[];
  context?: Record<string, unknown>;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function AiInsightSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  staticPoints,
  context,
}: AiInsightSheetProps) {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = React.useState(false);

  function getDefaultPoints(): string[] {
    const value =
      typeof context?.value === "string" ? context?.value : undefined;
    return [
      `Current signal: ${value ?? "placeholder value"}`,
      "Recent trend: placeholder trend (up/down/flat)",
      "Suggested next step: placeholder action",
    ];
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Placeholder assistant response — no real API call yet
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Placeholder insight for “${title}”. This will be powered by AI soon.`,
      };
      setMessages((m) => [...m, assistantMsg]);
      setIsSending(false);
    }, 400);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  const points =
    staticPoints && staticPoints.length > 0 ? staticPoints : getDefaultPoints();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {title}
          </SheetTitle>
          {subtitle ? <SheetDescription>{subtitle}</SheetDescription> : null}
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Key Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="flex-1 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm">
                AI Insights (placeholder)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex h-full flex-col gap-3 p-4">
              <div className="flex-1 overflow-y-auto rounded-md border p-3 text-sm">
                {messages.length === 0 ? (
                  <div className="text-muted-foreground">
                    Ask a question about this item. Responses are placeholders
                    for now.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((m) => (
                      <div key={m.id} className="flex items-start gap-2">
                        {m.role === "assistant" ? (
                          <BotIcon className="mt-1 h-4 w-4 text-muted-foreground" />
                        ) : (
                          <UserIcon className="mt-1 h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="whitespace-pre-wrap break-words">
                          {m.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Textarea
                  placeholder="Type a question…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoSize
                  className="pr-20"
                />
                <Button
                  size="sm"
                  className="absolute bottom-1.5 right-1.5"
                  onClick={handleSend}
                  disabled={isSending || !input.trim()}
                >
                  Ask
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <SheetFooter className="p-4 pt-0">
          <div className="text-muted-foreground text-xs">
            Note: This is a prototype. AI responses are not live yet.
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default AiInsightSheet;
