"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from "react";

export interface ComponentContext {
  componentType: string;
  componentId: string;
  data: any;
  insights: string[];
  metadata?: {
    title?: string;
    description?: string;
    value?: string | number;
    trend?: string;
    [key: string]: any;
  };
}

export interface PopupData {
  componentContext: ComponentContext;
  position: { x: number; y: number };
  timestamp: number;
}

interface ComponentInteractionContextType {
  // Popup state
  activePopup: PopupData | null;
  showPopup: (
    componentContext: ComponentContext,
    position: { x: number; y: number }
  ) => void;
  hidePopup: () => void;

  // Multi-selection context capture
  selectedContexts: ComponentContext[];
  isMultiSelectMode: boolean;
  addContext: (context: ComponentContext) => void;
  removeContext: (componentId: string) => void;
  clearContexts: () => void;

  // AI integration
  sendContextsToAI: () => void;

  // Event handlers
  handleComponentClick: (
    componentContext: ComponentContext,
    event: React.MouseEvent,
    position?: { x: number; y: number }
  ) => void;
}

const ComponentInteractionContext = createContext<
  ComponentInteractionContextType | undefined
>(undefined);

export function ComponentInteractionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activePopup, setActivePopup] = useState<PopupData | null>(null);
  const [selectedContexts, setSelectedContexts] = useState<ComponentContext[]>(
    []
  );
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const popupTimeoutRef = useRef<NodeJS.Timeout>();

  // Clear popup after a delay
  useEffect(() => {
    if (activePopup) {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
      popupTimeoutRef.current = setTimeout(() => {
        setActivePopup(null);
      }, 5000); // Auto-hide after 5 seconds
    }
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, [activePopup]);

  // Listen for keyboard events to enable multi-select mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && !isMultiSelectMode) {
        setIsMultiSelectMode(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!event.shiftKey && isMultiSelectMode) {
        setIsMultiSelectMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isMultiSelectMode]);

  const showPopup = useCallback(
    (
      componentContext: ComponentContext,
      position: { x: number; y: number }
    ) => {
      setActivePopup({
        componentContext,
        position,
        timestamp: Date.now(),
      });
    },
    []
  );

  const hidePopup = useCallback(() => {
    setActivePopup(null);
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
  }, []);

  const addContext = useCallback((context: ComponentContext) => {
    setSelectedContexts((prev) => {
      // Avoid duplicates
      const exists = prev.find((c) => c.componentId === context.componentId);
      if (exists) return prev;
      return [...prev, context];
    });
  }, []);

  const removeContext = useCallback((componentId: string) => {
    setSelectedContexts((prev) =>
      prev.filter((c) => c.componentId !== componentId)
    );
  }, []);

  const clearContexts = useCallback(() => {
    setSelectedContexts([]);
    setIsMultiSelectMode(false);
  }, []);

  const sendContextsToAI = useCallback(() => {
    if (selectedContexts.length === 0) return;

    // Create a formatted context string for AI
    const contextSummary = selectedContexts
      .map((context) => {
        const { componentType, metadata, insights, data } = context;

        let summary = `**${componentType}**`;
        if (metadata?.title) summary += ` - ${metadata.title}`;
        if (metadata?.value !== undefined) summary += ` (${metadata.value})`;

        if (insights.length > 0) {
          summary += `\n• ${insights.join("\n• ")}`;
        }

        // Add key data points
        if (data && typeof data === "object") {
          const keyPoints = Object.entries(data)
            .slice(0, 3) // Limit to top 3 key points
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
          if (keyPoints) {
            summary += `\nKey data: ${keyPoints}`;
          }
        }

        return summary;
      })
      .join("\n\n");

    // Trigger the AI chat with context (handled in background)
    const event = new CustomEvent("openAIChatWithContext", {
      detail: {
        contexts: selectedContexts,
        contextSummary: contextSummary,
        backgroundMode: true, // Don't show context in input bar
      },
    });
    window.dispatchEvent(event);

    // Clear contexts after sending
    clearContexts();
  }, [selectedContexts, clearContexts]);

  const handleComponentClick = useCallback(
    (
      componentContext: ComponentContext,
      event: React.MouseEvent,
      position?: { x: number; y: number }
    ) => {
      event.stopPropagation();

      const clickPosition = position || {
        x: event.clientX,
        y: event.clientY,
      };

      if (isMultiSelectMode) {
        // In multi-select mode, add to context and show brief confirmation
        addContext(componentContext);
        showPopup(
          {
            ...componentContext,
            insights: [
              `Added to selection (${selectedContexts.length + 1} items)`,
            ],
            metadata: {
              ...componentContext.metadata,
              title: "Added to Analysis",
              description: "Hold Shift to continue selecting",
            },
          },
          clickPosition
        );
      } else {
        // Normal mode, show component insights popup
        showPopup(componentContext, clickPosition);
      }
    },
    [isMultiSelectMode, selectedContexts.length, addContext, showPopup]
  );

  return (
    <ComponentInteractionContext.Provider
      value={{
        activePopup,
        showPopup,
        hidePopup,
        selectedContexts,
        isMultiSelectMode,
        addContext,
        removeContext,
        clearContexts,
        sendContextsToAI,
        handleComponentClick,
      }}
    >
      {children}
    </ComponentInteractionContext.Provider>
  );
}

export function useComponentInteraction() {
  const context = useContext(ComponentInteractionContext);
  if (context === undefined) {
    throw new Error(
      "useComponentInteraction must be used within a ComponentInteractionProvider"
    );
  }
  return context;
}
