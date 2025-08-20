"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EngagementData } from "@/types/customer-behavior";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useComponentInsights } from "@/hooks/use-component-insights";

interface EngagementMatrixProps {
  engagementData: EngagementData[];
}

export function EngagementMatrix({ engagementData }: EngagementMatrixProps) {
  const chartInsights = useComponentInsights({
    componentType: "Engagement Matrix",
    componentId: "engagement-matrix",
    data: {
      engagementData: engagementData,
      totalCustomers: engagementData?.length || 0,
      champions:
        engagementData?.filter((d) => d.segment === "champions").length || 0,
      atRisk:
        engagementData?.filter((d) => d.segment === "at_risk").length || 0,
      avgEngagement:
        engagementData?.reduce((sum, d) => sum + d.engagement_score, 0) /
        (engagementData?.length || 1),
      avgFrequency:
        engagementData?.reduce((sum, d) => sum + d.frequency, 0) /
        (engagementData?.length || 1),
    },
    generateInsights: (data) => {
      const insights = [];
      if (data.totalCustomers > 0) {
        insights.push(
          `Customer engagement analysis for ${data.totalCustomers} customers`
        );

        const championsPct = (data.champions / data.totalCustomers) * 100;
        const atRiskPct = (data.atRisk / data.totalCustomers) * 100;

        if (championsPct > 20) {
          insights.push(
            `Excellent: ${championsPct.toFixed(
              1
            )}% are Champions - high-value customers`
          );
        } else if (championsPct > 10) {
          insights.push(
            `Good: ${championsPct.toFixed(
              1
            )}% are Champions - solid customer base`
          );
        } else {
          insights.push(
            `Opportunity: Only ${championsPct.toFixed(
              1
            )}% are Champions - focus on upgrades`
          );
        }

        if (atRiskPct > 25) {
          insights.push(
            `ALERT: ${atRiskPct.toFixed(
              1
            )}% customers at risk - retention campaigns needed`
          );
        } else if (atRiskPct > 15) {
          insights.push(
            `Watch: ${atRiskPct.toFixed(
              1
            )}% customers at risk - monitor closely`
          );
        } else {
          insights.push(
            `Stable: ${atRiskPct.toFixed(1)}% at risk - manageable churn level`
          );
        }

        insights.push(
          `Average engagement score: ${data.avgEngagement.toFixed(1)}/100`
        );
        insights.push(
          `Average purchase frequency: ${data.avgFrequency.toFixed(
            1
          )} per month`
        );

        insights.push(
          "Use this matrix to identify upsell and retention opportunities"
        );
      } else {
        insights.push("No engagement data available for analysis");
      }
      return insights;
    },
    metadata: {
      title: "Customer Engagement Matrix",
      description: "RFM-based customer segmentation",
      value: engagementData?.length
        ? `${engagementData.length} customers`
        : "No data",
    },
  });
  const getEngagementColor = (level: string) => {
    switch (level) {
      case "champions":
        return "hsl(var(--chart-1))";
      case "loyal":
        return "hsl(var(--chart-2))";
      case "promising":
        return "hsl(var(--chart-3))";
      case "at_risk":
        return "hsl(var(--destructive))";
      default:
        return "hsl(var(--muted-foreground))";
    }
  };

  const getEngagementLabel = (level: string) => {
    switch (level) {
      case "champions":
        return "Champions";
      case "loyal":
        return "Loyal";
      case "promising":
        return "Promising";
      case "at_risk":
        return "At Risk";
      default:
        return "Unknown";
    }
  };

  const chartData = engagementData.map((data) => ({
    ...data,
    color: getEngagementColor(data.engagement_level),
    size: Math.max(4, Math.min(12, data.spend_volume / 1000)),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.customer_id}</p>
          <p className="text-sm text-muted-foreground">
            Recency: {data.recency} days
          </p>
          <p className="text-sm text-muted-foreground">
            Frequency: {data.frequency} transactions
          </p>
          <p className="text-sm text-muted-foreground">
            Spend: ${data.spend_volume.toLocaleString()}
          </p>
          <Badge variant="outline" className="mt-1">
            {getEngagementLabel(data.engagement_level)}
          </Badge>
        </div>
      );
    }
    return null;
  };

  const engagementStats = engagementData.reduce((acc, data) => {
    acc[data.engagement_level] = (acc[data.engagement_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCustomers = engagementData.length;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      {...chartInsights.getClickProps()}
    >
      <CardHeader>
        <CardTitle>Customer Engagement Matrix</CardTitle>
        <CardDescription>
          Customer distribution by recency vs frequency with churn risk
          indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              data={chartData}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                dataKey="recency"
                name="Recency (Days)"
                domain={["dataMin", "dataMax"]}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                label={{
                  value: "Days Since Last Purchase",
                  position: "insideBottom",
                  offset: -10,
                }}
              />
              <YAxis
                type="number"
                dataKey="frequency"
                name="Frequency"
                domain={["dataMin", "dataMax"]}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                label={{
                  value: "Purchase Frequency",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Customers" dataKey="frequency">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    r={entry.size}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(engagementStats).map(([level, count]) => (
            <div key={level} className="text-center p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getEngagementColor(level) }}
                />
                <span className="text-sm font-medium">
                  {getEngagementLabel(level)}
                </span>
              </div>
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-muted-foreground">
                {((count / totalCustomers) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-muted/20 rounded-lg">
          <h4 className="font-semibold mb-2">Engagement Quadrants</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <strong className="text-green-600">Champions:</strong> High
              frequency, low recency
            </div>
            <div>
              <strong className="text-blue-600">Loyal:</strong> High frequency,
              moderate recency
            </div>
            <div>
              <strong className="text-yellow-600">Promising:</strong> Moderate
              frequency, low recency
            </div>
            <div>
              <strong className="text-red-600">At Risk:</strong> Low frequency,
              high recency
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
