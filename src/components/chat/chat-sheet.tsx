"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Textarea from "@/components/ui/textarea";
import {
  MessageCircleIcon,
  AtSignIcon,
  SendIcon,
  BotIcon,
  UserIcon,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
};

const AGENTS = [
  { id: "customer", label: "Customer Agent" },
  { id: "sales", label: "Sales Agent" },
  { id: "behaviour", label: "Behaviour Agent" },
];

function useMentions(input: string) {
  const atIndex = input.lastIndexOf("@");
  const hasMention = atIndex !== -1;
  const query = hasMention ? input.slice(atIndex + 1).trim() : "";
  return { hasMention, atIndex, query };
}

export function ChatSheet() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [selectedAgent, setSelectedAgent] = React.useState<string | undefined>(
    undefined
  );
  const [isSending, setIsSending] = React.useState(false);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  const { hasMention, atIndex, query } = useMentions(input);
  const filteredAgents = React.useMemo(() => {
    const q = query.toLowerCase();
    return AGENTS.filter((a) => a.label.toLowerCase().includes(q));
  }, [query]);

  React.useEffect(() => {
    if (!open) return;
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  function applyAgentToInput(agentLabel: string) {
    if (atIndex === -1) return;
    const before = input.slice(0, atIndex);
    // Insert mention token (e.g., @Customer Agent ) and set selection
    const next = `${before}@${agentLabel} `;
    setInput(next);
    setSelectedAgent(agentLabel);
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    // Extract agent from an @mention at the start of the prompt (optional)
    const mentionMatch = trimmed.match(/^@([^\n]+?)\s+/);
    const agentFromMention = mentionMatch?.[1];
    const contentOnly = agentFromMention
      ? trimmed.replace(/^@[^\n]+?\s+/, "")
      : trimmed;
    const agentToUse = agentFromMention || selectedAgent;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      agent: agentToUse,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: contentOnly, agent: agentToUse }),
      });
      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data?.reply ?? "(no response)",
        agent: data?.agent,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (e) {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Error contacting chatbot API.",
      };
      setMessages((m) => [...m, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          aria-label="Open chatbot"
          className="fixed bottom-4 right-4 z-40 shadow-md"
          size="lg"
        >
          <MessageCircleIcon className="size-4" />
          Chat
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BotIcon className="size-5" />
            Chatbot
          </SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          <Card className="flex-1 overflow-hidden">
            <CardContent className="h-full p-0">
              <div ref={viewportRef} className="h-[60vh] overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    Start chatting — you can mention an agent with @
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((m) => (
                      <div key={m.id} className="flex items-start gap-2">
                        {m.role === "assistant" ? (
                          <BotIcon className="mt-1 size-4 text-muted-foreground" />
                        ) : (
                          <UserIcon className="mt-1 size-4 text-muted-foreground" />
                        )}
                        <div className="flex min-w-0 flex-col">
                          <div className="text-xs text-muted-foreground">
                            {m.role === "assistant"
                              ? m.agent || "Assistant"
                              : "You"}
                          </div>
                          <div className="whitespace-pre-wrap break-words text-sm">
                            {m.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute left-2 top-2.5 text-muted-foreground">
              <AtSignIcon className="size-4" />
            </div>
            <Textarea
              placeholder="Type a message... Use @ to pick an agent."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoSize
              className="pl-8 pr-12"
            />
            <Button
              onClick={() => void sendMessage()}
              disabled={isSending || !input.trim()}
              className="absolute bottom-1.5 right-1.5"
              size="sm"
            >
              <SendIcon className="size-4" />
              Send
            </Button>

            {hasMention && (
              <div className="bg-popover text-popover-foreground border-border absolute bottom-14 left-0 z-20 max-h-56 w-full overflow-y-auto rounded-md border shadow-md">
                {filteredAgents.length === 0 && (
                  <div className="text-muted-foreground px-3 py-2 text-xs">
                    No agents
                  </div>
                )}
                {filteredAgents.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm"
                    onClick={() => applyAgentToInput(a.label)}
                  >
                    <AtSignIcon className="size-4 text-muted-foreground" />
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="p-4 pt-0">
          <div className="text-muted-foreground text-xs">
            Tip: Press Cmd/Ctrl+Enter to send
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default ChatSheet;
