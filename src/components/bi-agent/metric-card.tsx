"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface MetricCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
  };
  color?: "default" | "success" | "warning" | "danger";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "default",
}: MetricCardData) {
  const colorClasses = {
    default: "border-border",
    success:
      "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20",
    warning:
      "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20",
    danger: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20",
  };

  const iconColors = {
    default: "text-muted-foreground",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    danger: "text-red-600 dark:text-red-400",
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case "up":
        return "↗";
      case "down":
        return "↘";
      case "neutral":
        return "→";
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";

    switch (trend.direction) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      case "neutral":
        return "text-muted-foreground";
      default:
        return "";
    }
  };

  return (
    <Card
      className={`${colorClasses[color]} shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {Icon && (
              <Icon className={`h-4 w-4 ${iconColors[color]} flex-shrink-0`} />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                {title}
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {value}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground leading-tight truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {trend && (
            <div
              className={`text-xs font-medium ${getTrendColor()} bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full flex-shrink-0`}
            >
              <span className="inline-flex items-center gap-1">
                {getTrendIcon()}
                {trend.value}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
