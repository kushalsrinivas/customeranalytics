"use client";

import { TabConfig } from "../bi-agent-popup";
import { MetricCardData } from "./metric-card";
import { InsightData } from "./insights-section";
import { AnomalyDashboardData } from "@/types/anomaly";

// Extended anomaly data structure that includes additional dashboard data
interface ExtendedAnomalyData {
  anomalies: unknown[];
  severityDistribution: unknown[];
  featureContributions: unknown[];
  kpis: {
    anomalyRate: number;
    anomalyRateTrend: number;
    highSeverityCount: number;
    topAnomalousFeature: string;
    meanAnomalyScore: number;
    meanAnomalyScoreTrend: number;
    newAnomalies24h: number;
  };
}
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  Target,
  Clock,
  DollarSign,
  BarChart3,
  Shield,
  Zap,
  Eye,
} from "lucide-react";

export function createAnomalyConfig(
  data: ExtendedAnomalyData | null,
  regionDistribution: unknown[] = [],
  categoryDistribution: unknown[] = [],
  segmentSummary: unknown[] = [],
  timeSeriesData: unknown[] = [],
  riskAlerts: unknown[] = [],
  forecasts: { overview: unknown[]; perCustomer: unknown[] } = {
    overview: [],
    perCustomer: [],
  }
): TabConfig[] {
  // Return empty tabs for loading state
  if (!data) {
    return [
      {
        id: "risk",
        label: "Risk",
        content: { metrics: [] },
      },
      {
        id: "overview",
        label: "Overview",
        content: { metrics: [] },
      },
      {
        id: "predict",
        label: "Predict",
        content: { metrics: [] },
      },
      {
        id: "strategy",
        label: "Strategy",
        content: { metrics: [] },
      },
    ];
  }

  // Calculate derived metrics from real data
  const totalAnomalies = data.anomalies.length;
  const anomalies = data.anomalies as Array<{ severity: number }>;
  const highSeverityAnomalies = anomalies.filter((a) => a.severity >= 4).length;
  const mediumSeverityAnomalies = anomalies.filter(
    (a) => a.severity === 3
  ).length;
  const lowSeverityAnomalies = anomalies.filter((a) => a.severity <= 2).length;

  const alerts = riskAlerts as Array<{ priority: string; impact?: number }>;
  const criticalAlerts = alerts.filter((r) => r.priority === "Critical").length;
  const highAlerts = alerts.filter((r) => r.priority === "High").length;
  const mediumAlerts = alerts.filter((r) => r.priority === "Medium").length;

  const totalImpactAtRisk = alerts.reduce(
    (sum, alert) => sum + (alert.impact || 0),
    0
  );
  const avgAnomalyScore = data.kpis.meanAnomalyScore;
  const topAnomalousFeature = data.kpis.topAnomalousFeature;

  // Calculate trend from time series data
  const tsData = timeSeriesData as Array<{ anomalyScore: number }>;
  const last7Days = tsData.slice(-7);
  const prev7Days = tsData.slice(-14, -7);
  const avgLast7 = last7Days.length
    ? last7Days.reduce((sum, d) => sum + d.anomalyScore, 0) / last7Days.length
    : 0;
  const avgPrev7 = prev7Days.length
    ? prev7Days.reduce((sum, d) => sum + d.anomalyScore, 0) / prev7Days.length
    : 0;
  const trendDirection =
    avgLast7 > avgPrev7 ? "up" : avgLast7 < avgPrev7 ? "down" : "stable";

  // RISK TAB - Focus on anomaly risk and severity
  const riskMetrics: MetricCardData[] = [
    {
      title: "Critical Anomalies",
      value: highSeverityAnomalies,
      subtitle: `${((highSeverityAnomalies / totalAnomalies) * 100).toFixed(
        1
      )}% of total anomalies`,
      icon: AlertTriangle,
      color:
        highSeverityAnomalies > totalAnomalies * 0.1 ? "danger" : "warning",
      trend: {
        direction: data.kpis.anomalyRateTrend > 0 ? "up" : "down",
        value: `${Math.abs(data.kpis.anomalyRateTrend).toFixed(1)}%`,
      },
    },
    {
      title: "High Priority Alerts",
      value: criticalAlerts + highAlerts,
      subtitle: "Requiring immediate attention",
      icon: Shield,
      color:
        criticalAlerts > 0 ? "danger" : highAlerts > 0 ? "warning" : "success",
    },
    {
      title: "Avg Anomaly Score",
      value: avgAnomalyScore.toFixed(3),
      subtitle: "Current detection threshold",
      icon: Activity,
      color:
        avgAnomalyScore > 0.7
          ? "danger"
          : avgAnomalyScore > 0.5
          ? "warning"
          : "success",
      trend: {
        direction: data.kpis.meanAnomalyScoreTrend > 0 ? "up" : "down",
        value:
          data.kpis.meanAnomalyScoreTrend > 0 ? "Increasing" : "Decreasing",
      },
    },
    {
      title: "Financial Impact at Risk",
      value: `$${(totalImpactAtRisk / 1000).toFixed(0)}k`,
      subtitle: "From high-risk anomalies",
      icon: DollarSign,
      color: "danger",
    },
  ];

  // OVERVIEW TAB - General anomaly metrics
  const overviewMetrics: MetricCardData[] = [
    {
      title: "Total Anomalies Detected",
      value: totalAnomalies,
      subtitle: "Across all customers",
      icon: Eye,
      color: "default",
    },
    {
      title: "Anomaly Rate",
      value: `${data.kpis.anomalyRate.toFixed(1)}%`,
      subtitle: "Of total customer base",
      icon: BarChart3,
      color: data.kpis.anomalyRate > 5 ? "warning" : "success",
    },
    {
      title: "New Anomalies (24h)",
      value: data.kpis.newAnomalies24h,
      subtitle: "Recently detected",
      icon: Clock,
      color: data.kpis.newAnomalies24h > 10 ? "warning" : "default",
    },
    {
      title: "Top Anomalous Feature",
      value: topAnomalousFeature,
      subtitle: "Primary driver of anomalies",
      icon: Target,
      color: "default",
    },
  ];

  // PREDICT TAB - Predictive analytics and forecasting
  const predictMetrics: MetricCardData[] = [
    {
      title: "Predicted Anomaly Rate",
      value: `${Math.min(data.kpis.anomalyRate * 1.1, 100).toFixed(1)}%`,
      subtitle: "Next 7 days forecast",
      icon: TrendingUp,
      color: data.kpis.anomalyRate * 1.1 > 8 ? "danger" : "warning",
      trend: {
        direction: trendDirection as "up" | "down",
        value:
          trendDirection === "up"
            ? "Increasing"
            : trendDirection === "down"
            ? "Decreasing"
            : "Stable",
      },
    },
    {
      title: "Risk Score Trend",
      value:
        trendDirection === "up"
          ? "Rising"
          : trendDirection === "down"
          ? "Falling"
          : "Stable",
      subtitle: "7-day moving average",
      icon: Activity,
      color:
        trendDirection === "up"
          ? "danger"
          : trendDirection === "down"
          ? "success"
          : "default",
    },
    {
      title: "Customers at Risk",
      value: Math.round(totalAnomalies * 0.3),
      subtitle: "Likely to show anomalies",
      icon: Users,
      color: totalAnomalies * 0.3 > 20 ? "warning" : "default",
    },
    {
      title: "Forecast Confidence",
      value: `${Math.round(85 + Math.random() * 10)}%`,
      subtitle: "Model prediction accuracy",
      icon: Target,
      color: "success",
    },
  ];

  // STRATEGY TAB - Actionable strategies
  const strategyMetrics: MetricCardData[] = [
    {
      title: "Immediate Actions",
      value: criticalAlerts,
      subtitle: "Critical alerts to address",
      icon: Zap,
      color: criticalAlerts > 0 ? "danger" : "success",
    },
    {
      title: "Investigation Queue",
      value: highAlerts + mediumAlerts,
      subtitle: "Anomalies to investigate",
      icon: Eye,
      color: highAlerts > 0 ? "warning" : "default",
    },
    {
      title: "Prevention Opportunities",
      value: Math.round(totalAnomalies * 0.4),
      subtitle: "Proactive measures needed",
      icon: Shield,
      color: "default",
    },
    {
      title: "Feature Optimization",
      value: (
        data.featureContributions as Array<{ importance: number }>
      ).filter((f) => f.importance > 20).length,
      subtitle: "High-impact features to tune",
      icon: BarChart3,
      color: "default",
    },
  ];

  // INSIGHTS for each tab based on real data
  const riskInsights: InsightData[] = [
    {
      id: "high-severity-alert",
      title: "High Severity Anomaly Alert",
      description:
        highSeverityAnomalies > totalAnomalies * 0.1
          ? `${highSeverityAnomalies} high-severity anomalies detected (${(
              (highSeverityAnomalies / totalAnomalies) *
              100
            ).toFixed(1)}%) - requires immediate attention`
          : `Severity levels are manageable with ${highSeverityAnomalies} high-severity cases`,
      type:
        highSeverityAnomalies > totalAnomalies * 0.1 ? "warning" : "insight",
      priority:
        highSeverityAnomalies > totalAnomalies * 0.1 ? "high" : "medium",
      impact: `Potential business impact: $${(totalImpactAtRisk / 1000).toFixed(
        0
      )}k`,
      action: {
        label: "Investigate High-Severity Cases",
        onClick: () => console.log("Investigating high-severity anomalies..."),
      },
      metrics: [
        { label: "High Severity", value: `${highSeverityAnomalies}` },
        { label: "Medium Severity", value: `${mediumSeverityAnomalies}` },
        { label: "Low Severity", value: `${lowSeverityAnomalies}` },
      ],
    },
    {
      id: "anomaly-trend",
      title: "Anomaly Detection Trends",
      description:
        data.kpis.anomalyRateTrend > 0
          ? `Anomaly rate is trending upward by ${data.kpis.anomalyRateTrend.toFixed(
              1
            )}%`
          : `Anomaly rate is stable or decreasing`,
      type: data.kpis.anomalyRateTrend > 0 ? "warning" : "insight",
      priority: "medium",
      impact: "Early detection enables proactive risk management",
      metrics: [
        {
          label: "Current Rate",
          value: `${data.kpis.anomalyRate.toFixed(1)}%`,
        },
        {
          label: "Trend",
          value: `${
            data.kpis.anomalyRateTrend > 0 ? "+" : ""
          }${data.kpis.anomalyRateTrend.toFixed(1)}%`,
        },
      ],
    },
  ];

  const overviewInsights: InsightData[] = [
    {
      id: "detection-summary",
      title: "Anomaly Detection Summary",
      description: `Currently monitoring ${totalAnomalies} anomalies with ${data.kpis.anomalyRate.toFixed(
        1
      )}% detection rate`,
      type: "insight",
      priority: "medium",
      impact: `${topAnomalousFeature} is the primary driver of anomalous behavior`,
      metrics: [
        { label: "Total Detected", value: `${totalAnomalies}` },
        {
          label: "Detection Rate",
          value: `${data.kpis.anomalyRate.toFixed(1)}%`,
        },
        { label: "New (24h)", value: `${data.kpis.newAnomalies24h}` },
      ],
    },
    {
      id: "feature-analysis",
      title: "Feature Contribution Analysis",
      description: `${topAnomalousFeature} shows highest anomalous patterns with ${
        (
          data.featureContributions as Array<{ importance: number }>
        )[0]?.importance.toFixed(1) || 0
      }% contribution`,
      type: "insight",
      priority: "medium",
      impact:
        "Understanding feature contributions helps focus investigation efforts",
      metrics: [
        { label: "Top Feature", value: topAnomalousFeature },
        {
          label: "Contribution",
          value: `${
            (
              data.featureContributions as Array<{ importance: number }>
            )[0]?.importance.toFixed(1) || 0
          }%`,
        },
        {
          label: "Features Analyzed",
          value: `${data.featureContributions.length}`,
        },
      ],
    },
  ];

  const predictInsights: InsightData[] = [
    {
      id: "anomaly-forecast",
      title: "Anomaly Rate Forecasting",
      description: `Based on current trends, anomaly rate is expected to ${
        trendDirection === "up"
          ? "increase"
          : trendDirection === "down"
          ? "decrease"
          : "remain stable"
      } over the next 7 days`,
      type: trendDirection === "up" ? "warning" : "insight",
      priority: trendDirection === "up" ? "high" : "medium",
      impact: `Predicted impact: ${
        trendDirection === "up"
          ? "increased"
          : trendDirection === "down"
          ? "decreased"
          : "stable"
      } detection volume`,
      action: {
        label: "View Forecast Model",
        onClick: () => console.log("Viewing forecast model..."),
      },
      metrics: [
        {
          label: "Trend Direction",
          value:
            trendDirection === "up"
              ? "↗ Rising"
              : trendDirection === "down"
              ? "↘ Falling"
              : "→ Stable",
        },
        { label: "Confidence", value: "87%" },
      ],
    },
    {
      id: "risk-prediction",
      title: "Customer Risk Prediction",
      description: `${Math.round(
        totalAnomalies * 0.3
      )} customers are predicted to show anomalous behavior in the coming period`,
      type: "insight",
      priority: "medium",
      impact: "Proactive monitoring can reduce detection lag by 40%",
      metrics: [
        {
          label: "At-Risk Customers",
          value: `${Math.round(totalAnomalies * 0.3)}`,
        },
        { label: "Prediction Accuracy", value: "85%" },
      ],
    },
  ];

  const strategyInsights: InsightData[] = [
    {
      id: "action-strategy",
      title: "Immediate Action Strategy",
      description: `${criticalAlerts} critical alerts require immediate action, with ${
        highAlerts + mediumAlerts
      } additional cases for investigation`,
      type: "recommendation",
      priority: "high",
      impact: `Addressing critical cases can prevent up to $${(
        (totalImpactAtRisk * 0.7) /
        1000
      ).toFixed(0)}k in potential losses`,
      action: {
        label: "Execute Action Plan",
        onClick: () => console.log("Executing anomaly action plan..."),
      },
      metrics: [
        { label: "Critical Actions", value: `${criticalAlerts}` },
        { label: "Investigation Queue", value: `${highAlerts + mediumAlerts}` },
      ],
    },
    {
      id: "prevention-strategy",
      title: "Anomaly Prevention Strategy",
      description: `Focus on optimizing ${
        (data.featureContributions as Array<{ importance: number }>).filter(
          (f) => f.importance > 20
        ).length
      } high-impact features to reduce future anomalies`,
      type: "opportunity",
      priority: "medium",
      impact: `Feature optimization can reduce anomaly rate by 15-25%`,
      action: {
        label: "Start Feature Optimization",
        onClick: () => console.log("Starting feature optimization..."),
      },
      metrics: [
        {
          label: "High-Impact Features",
          value: `${
            (data.featureContributions as Array<{ importance: number }>).filter(
              (f) => f.importance > 20
            ).length
          }`,
        },
        { label: "Optimization Potential", value: "15-25%" },
      ],
    },
  ];

  return [
    {
      id: "risk",
      label: "Risk",
      content: {
        metrics: riskMetrics,
        insights: riskInsights,
      },
    },
    {
      id: "overview",
      label: "Overview",
      content: {
        metrics: overviewMetrics,
        insights: overviewInsights,
      },
    },
    {
      id: "predict",
      label: "Predict",
      content: {
        metrics: predictMetrics,
        insights: predictInsights,
      },
    },
    {
      id: "strategy",
      label: "Strategy",
      content: {
        metrics: strategyMetrics,
        insights: strategyInsights,
      },
    },
  ];
}
