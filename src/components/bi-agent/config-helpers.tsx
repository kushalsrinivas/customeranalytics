"use client";

import { TabConfig } from "../bi-agent-sheet";
import { MetricCardData } from "./metric-card";
import { InsightData } from "./insights-section";

/**
 * Generic helper to create BI Agent configurations for different dashboard types
 */
export interface DashboardConfig {
  agentName: string;
  status?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  tabs: TabConfig[];
  defaultTab?: string;
}

/**
 * Create a basic three-tab configuration (Overview, Behavior, Anomaly)
 */
export function createBasicDashboardConfig(
  overviewMetrics: MetricCardData[],
  overviewInsights: InsightData[],
  behaviorMetrics: MetricCardData[],
  behaviorInsights: InsightData[],
  anomalyMetrics: MetricCardData[],
  anomalyInsights: InsightData[],
  customContent?: {
    overview?: React.ReactNode;
    behavior?: React.ReactNode;
    anomaly?: React.ReactNode;
  }
): TabConfig[] {
  return [
    {
      id: "overview",
      label: "Overview",
      content: {
        metrics: overviewMetrics,
        insights: overviewInsights,
        customContent: customContent?.overview,
      },
    },
    {
      id: "behavior",
      label: "Behavior Analysis",
      content: {
        metrics: behaviorMetrics,
        insights: behaviorInsights,
        customContent: customContent?.behavior,
      },
    },
    {
      id: "anomaly",
      label: "Anomaly Detection",
      content: {
        metrics: anomalyMetrics,
        insights: anomalyInsights,
        customContent: customContent?.anomaly,
      },
    },
  ];
}

/**
 * Create a custom configuration with flexible tabs
 */
export function createCustomDashboardConfig(
  tabs: Array<{
    id: string;
    label: string;
    metrics: MetricCardData[];
    insights?: InsightData[];
    customContent?: React.ReactNode;
  }>
): TabConfig[] {
  return tabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    content: {
      metrics: tab.metrics,
      insights: tab.insights || [],
      customContent: tab.customContent,
    },
  }));
}

/**
 * Helper to create metric cards with common patterns
 */
export const MetricHelpers = {
  percentage: (
    title: string,
    value: number,
    subtitle?: string,
    threshold?: { good: number; warning: number }
  ): MetricCardData => ({
    title,
    value: `${value.toFixed(1)}%`,
    subtitle,
    color: threshold
      ? value >= threshold.good
        ? "success"
        : value >= threshold.warning
        ? "warning"
        : "danger"
      : "default",
  }),

  currency: (
    title: string,
    value: number,
    subtitle?: string,
    format: "short" | "full" = "full"
  ): MetricCardData => ({
    title,
    value:
      format === "short"
        ? `$${(value / 1000).toFixed(0)}k`
        : `$${value.toFixed(2)}`,
    subtitle,
    color: "default",
  }),

  count: (
    title: string,
    value: number,
    subtitle?: string,
    trend?: { previous: number }
  ): MetricCardData => ({
    title,
    value: value.toString(),
    subtitle,
    color: "default",
    trend: trend
      ? {
          direction:
            value > trend.previous
              ? "up"
              : value < trend.previous
              ? "down"
              : "neutral",
          value: `${Math.abs(
            ((value - trend.previous) / trend.previous) * 100
          ).toFixed(1)}%`,
        }
      : undefined,
  }),

  score: (
    title: string,
    value: number,
    maxValue: number = 100,
    subtitle?: string
  ): MetricCardData => ({
    title,
    value: `${value}/${maxValue}`,
    subtitle,
    color:
      value >= maxValue * 0.8
        ? "success"
        : value >= maxValue * 0.6
        ? "warning"
        : "danger",
  }),
};

/**
 * Helper to create insights with common patterns
 */
export const InsightHelpers = {
  recommendation: (
    id: string,
    title: string,
    description: string,
    impact: string,
    actionLabel: string,
    actionCallback?: () => void,
    priority: "low" | "medium" | "high" = "medium"
  ): InsightData => ({
    id,
    title,
    description,
    type: "recommendation",
    priority,
    impact,
    action: {
      label: actionLabel,
      onClick: actionCallback,
    },
  }),

  warning: (
    id: string,
    title: string,
    description: string,
    impact: string,
    actionLabel: string,
    actionCallback?: () => void,
    priority: "low" | "medium" | "high" = "high"
  ): InsightData => ({
    id,
    title,
    description,
    type: "warning",
    priority,
    impact,
    action: {
      label: actionLabel,
      onClick: actionCallback,
    },
  }),

  opportunity: (
    id: string,
    title: string,
    description: string,
    impact: string,
    actionLabel: string,
    actionCallback?: () => void,
    priority: "low" | "medium" | "high" = "medium"
  ): InsightData => ({
    id,
    title,
    description,
    type: "opportunity",
    priority,
    impact,
    action: {
      label: actionLabel,
      onClick: actionCallback,
    },
  }),
};
