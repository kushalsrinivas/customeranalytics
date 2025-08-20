"use client";

import { useComponentInteraction } from "@/contexts/component-interaction-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Send } from "lucide-react";

export function MultiSelectIndicator() {
  const {
    isMultiSelectMode,
    selectedContexts,
    clearContexts,
    sendContextsToAI,
  } = useComponentInteraction();

  if (!isMultiSelectMode && selectedContexts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg px-4 py-2 flex items-center gap-3">
        {isMultiSelectMode && (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          >
            Multi-Select Mode
          </Badge>
        )}

        {selectedContexts.length > 0 && (
          <>
            <span className="text-sm text-muted-foreground">
              {selectedContexts.length} component
              {selectedContexts.length !== 1 ? "s" : ""} selected
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={sendContextsToAI}
              className="h-7 px-2 text-xs"
            >
              <Send className="h-3 w-3 mr-1" />
              Send to AI
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={clearContexts}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        )}

        {isMultiSelectMode && (
          <div className="text-xs text-muted-foreground border-l pl-3">
            Hold Shift and click components to select
          </div>
        )}
      </div>
    </div>
  );
}
