"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Brain, TrendingUp, AlertCircle } from "lucide-react";
import { useComponentInteraction } from "@/contexts/component-interaction-context";

export function ComponentInsightsPopup() {
  const {
    activePopup,
    hidePopup,
    isMultiSelectMode,
    selectedContexts,
    sendContextsToAI,
  } = useComponentInteraction();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activePopup) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [activePopup]);

  if (!activePopup || !isVisible) {
    return null;
  }

  const { componentContext, position } = activePopup;
  const { componentType, metadata, insights } = componentContext;

  // Adjust position to keep popup within viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 320),
    y: Math.min(position.y, window.innerHeight - 200),
  };

  const getComponentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "chart":
      case "graph":
        return <TrendingUp className="h-4 w-4" />;
      case "alert":
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightBadgeVariant = (insight: string) => {
    const lower = insight.toLowerCase();
    if (
      lower.includes("increase") ||
      lower.includes("high") ||
      lower.includes("good")
    ) {
      return "default";
    } else if (
      lower.includes("decrease") ||
      lower.includes("low") ||
      lower.includes("risk")
    ) {
      return "destructive";
    } else if (lower.includes("warning") || lower.includes("attention")) {
      return "secondary";
    }
    return "outline";
  };

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <Card className="w-80 shadow-lg border-2 pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getComponentIcon(componentType)}
              <CardTitle className="text-sm">
                {metadata?.title || componentType}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={hidePopup}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          {metadata?.description && (
            <p className="text-xs text-muted-foreground">
              {metadata.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Key Value */}
          {metadata?.value !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Value:</span>
              <Badge variant="outline" className="font-mono">
                {metadata.value}
                {metadata.trend && (
                  <span
                    className={`ml-1 ${
                      metadata.trend === "up"
                        ? "text-green-600"
                        : metadata.trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {metadata.trend === "up"
                      ? "↗"
                      : metadata.trend === "down"
                      ? "↘"
                      : "→"}
                  </span>
                )}
              </Badge>
            </div>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Key Insights:</span>
              <div className="space-y-1">
                {insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Badge
                      variant={getInsightBadgeVariant(insight)}
                      className="text-xs px-2 py-1 flex-shrink-0"
                    >
                      {index + 1}
                    </Badge>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {insight}
                    </p>
                  </div>
                ))}
                {insights.length > 3 && (
                  <p className="text-xs text-muted-foreground italic">
                    +{insights.length - 3} more insights...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Multi-select mode indicator */}
          {isMultiSelectMode && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Multi-Select Active
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedContexts.length} selected
                  </span>
                </div>
                {selectedContexts.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs px-2"
                    onClick={sendContextsToAI}
                  >
                    Send to AI
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Hold Shift and click components to select multiple
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
