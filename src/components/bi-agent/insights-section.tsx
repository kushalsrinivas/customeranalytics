"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LucideIcon,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export interface InsightData {
  id: string;
  title: string;
  description: string;
  type: "recommendation" | "warning" | "opportunity" | "insight";
  priority?: "low" | "medium" | "high";
  impact?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  metrics?: {
    label: string;
    value: string;
  }[];
}

interface InsightsSectionProps {
  insights: InsightData[];
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  const getInsightIcon = (type: InsightData["type"]): LucideIcon => {
    switch (type) {
      case "recommendation":
        return Lightbulb;
      case "warning":
        return AlertTriangle;
      case "opportunity":
        return TrendingUp;
      case "insight":
      default:
        return Lightbulb;
    }
  };

  const getInsightColors = (type: InsightData["type"]) => {
    switch (type) {
      case "recommendation":
        return {
          border: "border-blue-200 dark:border-blue-800",
          bg: "bg-blue-50 dark:bg-blue-950/20",
          icon: "text-blue-600 dark:text-blue-400",
          badge:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        };
      case "warning":
        return {
          border: "border-yellow-200 dark:border-yellow-800",
          bg: "bg-yellow-50 dark:bg-yellow-950/20",
          icon: "text-yellow-600 dark:text-yellow-400",
          badge:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        };
      case "opportunity":
        return {
          border: "border-green-200 dark:border-green-800",
          bg: "bg-green-50 dark:bg-green-950/20",
          icon: "text-green-600 dark:text-green-400",
          badge:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      case "insight":
      default:
        return {
          border: "border-purple-200 dark:border-purple-800",
          bg: "bg-purple-50 dark:bg-purple-950/20",
          icon: "text-purple-600 dark:text-purple-400",
          badge:
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        };
    }
  };

  const getPriorityColor = (priority?: InsightData["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-3">
      {insights.map((insight) => {
        const Icon = getInsightIcon(insight.type);
        const colors = getInsightColors(insight.type);

        return (
          <Card
            key={insight.id}
            className={`${colors.border} ${colors.bg} shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg ${colors.icon} shadow-sm flex-shrink-0`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-tight">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {insight.priority && (
                      <Badge
                        variant="secondary"
                        className={`${getPriorityColor(
                          insight.priority
                        )} text-xs px-2 py-0.5`}
                      >
                        {insight.priority.charAt(0).toUpperCase() +
                          insight.priority.slice(1)}
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={`${colors.badge} text-xs px-2 py-0.5`}
                    >
                      {insight.type.charAt(0).toUpperCase() +
                        insight.type.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Metrics */}
                {insight.metrics && insight.metrics.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {insight.metrics.map((metric, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                      >
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          {metric.label}:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Impact */}
                {insight.impact && (
                  <div className="text-xs bg-slate-50 dark:bg-slate-800/50 p-2 rounded border-l-2 border-primary">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Impact:
                    </span>{" "}
                    <span className="text-slate-600 dark:text-slate-400">
                      {insight.impact}
                    </span>
                  </div>
                )}

                {/* Action */}
                {insight.action && (
                  <div className="flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={insight.action.onClick}
                      className="gap-1 text-xs font-medium h-7"
                    >
                      {insight.action.label}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
