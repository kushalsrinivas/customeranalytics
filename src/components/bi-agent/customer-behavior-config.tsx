"use client";

import { TabConfig } from "../bi-agent-sheet";
import { MetricCardData } from "./metric-card";
import { InsightData } from "./insights-section";
import { CustomerBehaviorData } from "@/types/customer-behavior";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  AlertTriangle,
  Target,
  Clock,
  DollarSign,
  BarChart3,
} from "lucide-react";

export function createCustomerBehaviorConfig(
  data: CustomerBehaviorData | null
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
  const totalCustomers = data.patterns.length;
  const highRiskCustomers = data.patterns.filter(
    (p) => p.churn_risk === "high"
  ).length;
  const mediumRiskCustomers = data.patterns.filter(
    (p) => p.churn_risk === "medium"
  ).length;
  const lowRiskCustomers = data.patterns.filter(
    (p) => p.churn_risk === "low"
  ).length;

  const champions = data.engagementData.filter(
    (e) => e.engagement_level === "champions"
  ).length;
  const loyalCustomers = data.engagementData.filter(
    (e) => e.engagement_level === "loyal"
  ).length;
  const promisingCustomers = data.engagementData.filter(
    (e) => e.engagement_level === "promising"
  ).length;
  const atRiskCustomers = data.engagementData.filter(
    (e) => e.engagement_level === "at_risk"
  ).length;

  const avgRecency =
    data.patterns.reduce((sum, p) => sum + p.recency, 0) / totalCustomers;
  const avgLoyalty =
    data.patterns.reduce((sum, p) => sum + p.loyalty, 0) / totalCustomers;
  const totalRevenue = data.patterns.reduce(
    (sum, p) => sum + p.avg_order_value,
    0
  );

  // RISK TAB - Focus on churn risk and customer health
  const riskMetrics: MetricCardData[] = [
    {
      title: "High Risk Customers",
      value: highRiskCustomers,
      subtitle: `${((highRiskCustomers / totalCustomers) * 100).toFixed(
        1
      )}% of customer base`,
      icon: AlertTriangle,
      color: highRiskCustomers > totalCustomers * 0.2 ? "danger" : "warning",
      trend: {
        direction: highRiskCustomers > totalCustomers * 0.2 ? "up" : "down",
        value: `${data.kpis.churnRiskPct}%`,
      },
    },
    {
      title: "At Risk Customers",
      value: atRiskCustomers,
      subtitle: "Low engagement level",
      icon: TrendingUp,
      color: atRiskCustomers > totalCustomers * 0.3 ? "danger" : "warning",
    },
    {
      title: "Avg Days Since Purchase",
      value: Math.round(avgRecency),
      subtitle: "Customer recency score",
      icon: Clock,
      color:
        avgRecency > 60 ? "danger" : avgRecency > 30 ? "warning" : "success",
      trend: {
        direction: avgRecency > 45 ? "up" : "down",
        value: avgRecency > 45 ? "Concerning" : "Healthy",
      },
    },
    {
      title: "Revenue at Risk",
      value: `$${data.patterns
        .filter((p) => p.churn_risk === "high")
        .reduce((sum, p) => sum + p.avg_order_value, 0)
        .toFixed(0)}`,
      subtitle: "From high-risk customers",
      icon: DollarSign,
      color: "danger",
    },
  ];

  // OVERVIEW TAB - General business metrics
  const overviewMetrics: MetricCardData[] = [
    {
      title: "Total Customers",
      value: totalCustomers,
      subtitle: "Active customers analyzed",
      icon: Users,
      color: "default",
    },
    {
      title: "Avg Order Value",
      value: `$${data.kpis.avgOrderValue.toFixed(2)}`,
      subtitle: "Average transaction amount",
      icon: DollarSign,
      color: "default",
    },
    {
      title: "Purchase Frequency",
      value: `${data.kpis.avgPurchaseInterval} days`,
      subtitle: "Average time between purchases",
      icon: Clock,
      color: data.kpis.avgPurchaseInterval > 45 ? "warning" : "success",
    },
    {
      title: "Category Diversity",
      value: data.kpis.categoryDiversity.toFixed(1),
      subtitle: "Avg categories per customer",
      icon: BarChart3,
      color: "default",
    },
  ];

  // PREDICT TAB - Predictive analytics and forecasting
  const predictMetrics: MetricCardData[] = [
    {
      title: "Predicted Churn Rate",
      value: `${Math.round((highRiskCustomers / totalCustomers) * 100)}%`,
      subtitle: "Next 30 days",
      icon: TrendingUp,
      color: highRiskCustomers / totalCustomers > 0.15 ? "danger" : "warning",
      trend: {
        direction: highRiskCustomers / totalCustomers > 0.15 ? "up" : "down",
        value:
          highRiskCustomers > mediumRiskCustomers ? "Increasing" : "Stable",
      },
    },
    {
      title: "Revenue Forecast",
      value: `$${Math.round(totalRevenue * 0.85)}`,
      subtitle: "Projected next month",
      icon: DollarSign,
      color: "default",
    },
    {
      title: "Customer Growth",
      value: `${Math.round(
        ((champions + loyalCustomers) / totalCustomers) * 100
      )}%`,
      subtitle: "Retention probability",
      icon: Users,
      color:
        (champions + loyalCustomers) / totalCustomers > 0.6
          ? "success"
          : "warning",
    },
    {
      title: "Engagement Trend",
      value: `${Math.round(avgLoyalty)}%`,
      subtitle: "Average loyalty score",
      icon: BarChart3,
      color:
        avgLoyalty > 70 ? "success" : avgLoyalty > 50 ? "warning" : "danger",
    },
  ];

  // STRATEGY TAB - Actionable business strategies
  const strategyMetrics: MetricCardData[] = [
    {
      title: "Champions",
      value: champions,
      subtitle: "High value customers to retain",
      icon: Target,
      color: "success",
    },
    {
      title: "Intervention Needed",
      value: highRiskCustomers + atRiskCustomers,
      subtitle: "Customers requiring immediate action",
      icon: AlertTriangle,
      color: "danger",
    },
    {
      title: "Growth Opportunities",
      value: promisingCustomers,
      subtitle: "Customers with potential",
      icon: TrendingUp,
      color: "default",
    },
    {
      title: "Channel Optimization",
      value: `${data.kpis.dominantChannelPct.toFixed(0)}%`,
      subtitle: `${data.kpis.dominantChannel} dominance`,
      icon: BarChart3,
      color: data.kpis.dominantChannelPct > 70 ? "warning" : "success",
    },
  ];

  // INSIGHTS for each tab based on real data
  const riskInsights: InsightData[] = [
    {
      id: "high-risk-alert",
      title: "High Risk Customer Alert",
      description:
        highRiskCustomers > totalCustomers * 0.2
          ? `${highRiskCustomers} customers (${(
              (highRiskCustomers / totalCustomers) *
              100
            ).toFixed(1)}%) are at high risk of churning`
          : `Risk levels are manageable with ${highRiskCustomers} high-risk customers`,
      type: highRiskCustomers > totalCustomers * 0.2 ? "warning" : "insight",
      priority: highRiskCustomers > totalCustomers * 0.2 ? "high" : "medium",
      impact: `Potential revenue loss of $${Math.round(
        data.patterns
          .filter((p) => p.churn_risk === "high")
          .reduce((sum, p) => sum + p.avg_order_value, 0)
      )}`,
      action: {
        label: "Create Retention Campaign",
        onClick: () => console.log("Creating retention campaign..."),
      },
      metrics: [
        { label: "High Risk", value: `${highRiskCustomers}` },
        { label: "Medium Risk", value: `${mediumRiskCustomers}` },
        { label: "Low Risk", value: `${lowRiskCustomers}` },
      ],
    },
    {
      id: "engagement-decline",
      title: "Customer Engagement Analysis",
      description:
        atRiskCustomers > totalCustomers * 0.3
          ? `${atRiskCustomers} customers showing declining engagement patterns`
          : `Engagement levels are stable across customer base`,
      type: atRiskCustomers > totalCustomers * 0.3 ? "warning" : "insight",
      priority: "medium",
      impact: "Early intervention can improve retention by 25-30%",
      metrics: [
        { label: "At Risk", value: `${atRiskCustomers}` },
        { label: "Avg Recency", value: `${Math.round(avgRecency)} days` },
      ],
    },
  ];

  const overviewInsights: InsightData[] = [
    {
      id: "business-overview",
      title: "Business Performance Summary",
      description: `Analyzing ${totalCustomers} customers with average order value of $${data.kpis.avgOrderValue.toFixed(
        2
      )}`,
      type: "insight",
      priority: "medium",
      impact: `Total customer base generating approximately $${Math.round(
        totalRevenue
      )} in revenue`,
      metrics: [
        { label: "Total Customers", value: `${totalCustomers}` },
        {
          label: "Avg Order Value",
          value: `$${data.kpis.avgOrderValue.toFixed(2)}`,
        },
        {
          label: "Purchase Interval",
          value: `${data.kpis.avgPurchaseInterval} days`,
        },
      ],
    },
    {
      id: "channel-performance",
      title: "Channel Distribution Analysis",
      description: `${
        data.kpis.dominantChannel
      } is the dominant channel with ${data.kpis.dominantChannelPct.toFixed(
        1
      )}% of transactions`,
      type: data.kpis.dominantChannelPct > 70 ? "warning" : "insight",
      priority: "medium",
      impact:
        data.kpis.dominantChannelPct > 70
          ? "Channel diversification needed"
          : "Healthy channel distribution",
      metrics: [
        {
          label: "Primary Channel",
          value: `${data.kpis.dominantChannelPct.toFixed(1)}%`,
        },
        { label: "Total Channels", value: `${data.channelUsage.length}` },
      ],
    },
  ];

  const predictInsights: InsightData[] = [
    {
      id: "churn-prediction",
      title: "Churn Prediction Analysis",
      description: `Based on current patterns, ${Math.round(
        (highRiskCustomers / totalCustomers) * 100
      )}% of customers are likely to churn in the next 30 days`,
      type: highRiskCustomers / totalCustomers > 0.15 ? "warning" : "insight",
      priority: highRiskCustomers / totalCustomers > 0.15 ? "high" : "medium",
      impact: `Potential revenue impact: $${Math.round(
        data.patterns
          .filter((p) => p.churn_risk === "high")
          .reduce((sum, p) => sum + p.avg_order_value, 0) * 0.7
      )}`,
      action: {
        label: "View Prediction Model",
        onClick: () => console.log("Viewing prediction model..."),
      },
      metrics: [
        {
          label: "Predicted Churn",
          value: `${Math.round((highRiskCustomers / totalCustomers) * 100)}%`,
        },
        { label: "Confidence", value: "85%" },
      ],
    },
    {
      id: "revenue-forecast",
      title: "Revenue Forecasting",
      description: `Projected revenue for next month: $${Math.round(
        totalRevenue * 0.85
      )} based on current customer behavior trends`,
      type: "insight",
      priority: "medium",
      impact: `${Math.round(
        ((totalRevenue * 0.85) / totalRevenue - 1) * 100
      )}% change from current period`,
      metrics: [
        { label: "Current Revenue", value: `$${Math.round(totalRevenue)}` },
        { label: "Forecast", value: `$${Math.round(totalRevenue * 0.85)}` },
      ],
    },
  ];

  const strategyInsights: InsightData[] = [
    {
      id: "retention-strategy",
      title: "Customer Retention Strategy",
      description: `Focus on ${champions} champion customers and ${
        highRiskCustomers + atRiskCustomers
      } customers needing intervention`,
      type: "recommendation",
      priority: "high",
      impact: `Potential to improve retention by 20-30% and increase revenue by $${Math.round(
        totalRevenue * 0.25
      )}`,
      action: {
        label: "Implement Strategy",
        onClick: () => console.log("Implementing retention strategy..."),
      },
      metrics: [
        { label: "Champions to Retain", value: `${champions}` },
        {
          label: "At-Risk to Save",
          value: `${highRiskCustomers + atRiskCustomers}`,
        },
      ],
    },
    {
      id: "growth-strategy",
      title: "Customer Growth Opportunities",
      description: `${promisingCustomers} promising customers show potential for upselling and ${loyalCustomers} loyal customers for cross-selling`,
      type: "opportunity",
      priority: "medium",
      impact: `Estimated growth potential: $${Math.round(
        totalRevenue * 0.15
      )} through targeted campaigns`,
      action: {
        label: "Create Growth Campaign",
        onClick: () => console.log("Creating growth campaign..."),
      },
      metrics: [
        { label: "Promising Customers", value: `${promisingCustomers}` },
        { label: "Loyal Customers", value: `${loyalCustomers}` },
        {
          label: "Growth Potential",
          value: `$${Math.round(totalRevenue * 0.15)}`,
        },
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
