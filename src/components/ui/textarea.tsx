"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoSize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoSize = false, ...props }, ref) => {
    const localRef = React.useRef<HTMLTextAreaElement | null>(null);
    const combinedRef = (node: HTMLTextAreaElement) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          node;
    };

    React.useEffect(() => {
      if (!autoSize) return;
      const el = localRef.current;
      if (!el) return;
      const handler = () => {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      };
      handler();
      el.addEventListener("input", handler);
      return () => el.removeEventListener("input", handler);
    }, [autoSize]);

    return (
      <textarea
        ref={combinedRef}
        className={cn(
          "flex min-h-[2.5rem] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export default Textarea;
