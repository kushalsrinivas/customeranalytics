"use client";

import { useMemo, useState } from "react";
import type {
  AnomalyDataPoint,
  FeatureContributionSummary,
} from "@/types/anomaly";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AiInsightSheet } from "@/components/ai-insight-sheet";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useComponentInsights } from "@/hooks/use-component-insights";

const AVAILABLE_FEATURES = [
  { key: "anomalyScore", label: "Anomaly Score" },
  { key: "transactionCount", label: "Transaction Count" },
  { key: "totalAmount", label: "Total Amount" },
  { key: "avgAmount", label: "Average Amount" },
  { key: "severity", label: "Severity Level" },
] as const;

type FeatureKey = (typeof AVAILABLE_FEATURES)[number]["key"];

export function FeatureScatter({
  anomalies,
  featureContributions,
  onPointClick,
}: {
  anomalies: AnomalyDataPoint[];
  featureContributions: FeatureContributionSummary[];
  onPointClick?: (a: AnomalyDataPoint) => void;
}) {
  const [xKey, setXKey] = useState<FeatureKey>("anomalyScore");
  const [yKey, setYKey] = useState<FeatureKey>("transactionCount");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AnomalyDataPoint | null>(null);

  const chartInsights = useComponentInsights({
    componentType: "Scatter Chart",
    componentId: "feature-scatter-chart",
    data: {
      anomalies: anomalies,
      featureContributions: featureContributions,
      totalPoints: anomalies?.length || 0,
      xFeature: xKey,
      yFeature: yKey,
      highSeverityCount: anomalies?.filter((a) => a.severity >= 4).length || 0,
      avgAnomalyScore:
        anomalies?.reduce((sum, a) => sum + a.anomalyScore, 0) /
        (anomalies?.length || 1),
    },
    generateInsights: (data) => {
      const insights = [];
      if (data.totalPoints > 0) {
        insights.push(
          `Scatter plot analysis of ${data.totalPoints} anomalous customers`
        );
        insights.push(
          `X-axis: ${
            AVAILABLE_FEATURES.find((f) => f.key === data.xFeature)?.label
          }`
        );
        insights.push(
          `Y-axis: ${
            AVAILABLE_FEATURES.find((f) => f.key === data.yFeature)?.label
          }`
        );

        if (data.highSeverityCount > 0) {
          insights.push(
            `${data.highSeverityCount} high-severity anomalies (red points) require immediate attention`
          );
        }

        insights.push(
          `Average anomaly score: ${data.avgAnomalyScore.toFixed(3)}`
        );

        // Feature-specific insights
        if (
          data.xFeature === "anomalyScore" ||
          data.yFeature === "anomalyScore"
        ) {
          insights.push(
            "Look for clusters of high anomaly scores (outliers in top-right)"
          );
        }

        if (
          data.xFeature === "transactionCount" ||
          data.yFeature === "transactionCount"
        ) {
          insights.push(
            "High transaction counts with high anomaly scores indicate unusual spending patterns"
          );
        }

        if (
          data.xFeature === "totalAmount" ||
          data.yFeature === "totalAmount"
        ) {
          insights.push(
            "Large amounts with anomalous behavior may indicate fraud or VIP customers"
          );
        }

        insights.push(
          "Click on individual points to investigate specific customers"
        );
      } else {
        insights.push("No anomaly data available for scatter plot analysis");
      }
      return insights;
    },
    metadata: {
      title: "Feature Correlation Analysis",
      description: "Scatter plot of anomaly features",
      value: anomalies?.length ? `${anomalies.length} anomalies` : "No data",
    },
  });

  const groupedBySeverity = useMemo(() => {
    const groups: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    anomalies.forEach((a) => {
      groups[a.severity].push({
        x: a[xKey as keyof AnomalyDataPoint] as number,
        y: a[yKey as keyof AnomalyDataPoint] as number,
        name: a.customerName,
        id: a.customerId,
        raw: a,
      });
    });
    return groups;
  }, [anomalies, xKey, yKey]);

  const colors: Record<number, string> = {
    1: "#00e0ff",
    2: "#5fd4d6",
    3: "#5891cb",
    4: "#aa45dd",
    5: "#e930ff",
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      {...chartInsights.getClickProps()}
    >
      <CardHeader>
        <CardTitle>Feature Contribution Analysis</CardTitle>
        <CardDescription>
          Explore anomalous customers across features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs mb-1">X-Axis Feature</label>
            <select
              className="w-full border rounded-md bg-card text-sm p-2"
              value={xKey}
              onChange={(e) => setXKey(e.target.value as FeatureKey)}
            >
              {AVAILABLE_FEATURES.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Y-Axis Feature</label>
            <select
              className="w-full border rounded-md bg-card text-sm p-2"
              value={yKey}
              onChange={(e) => setYKey(e.target.value as FeatureKey)}
            >
              {AVAILABLE_FEATURES.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name={xKey}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={yKey}
                tick={{ fontSize: 12 }}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend />

              {([1, 2, 3, 4, 5] as const).map((level) => (
                <Scatter
                  key={level}
                  name={`Severity ${level}`}
                  data={groupedBySeverity[level]}
                  fill={colors[level]}
                  onClick={(data) => {
                    if (onPointClick) onPointClick(data.raw);
                    else {
                      setSelected(data.raw);
                      setOpen(true);
                    }
                  }}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {featureContributions.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {featureContributions.slice(0, 6).map((f) => (
              <div
                key={f.featureName}
                className="rounded-md border p-2 text-sm"
              >
                <div className="font-semibold text-primary truncate">
                  {f.featureName}
                </div>
                <div className="text-xs opacity-70">
                  {f.importance.toFixed(1)}% contribution
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {!onPointClick && (
        <AiInsightSheet
          open={open}
          onOpenChange={setOpen}
          title={selected ? `Customer: ${selected.customerName}` : "Customer"}
          subtitle={
            selected
              ? `X: ${String(
                  selected[xKey as keyof AnomalyDataPoint]
                )} • Y: ${String(selected[yKey as keyof AnomalyDataPoint])}`
              : undefined
          }
          context={{
            type: "scatter",
            value: selected
              ? `${String(selected[xKey as keyof AnomalyDataPoint])},${String(
                  selected[yKey as keyof AnomalyDataPoint]
                )}`
              : undefined,
          }}
          staticPoints={
            selected
              ? [
                  `Anomaly score: ${selected.anomalyScore.toFixed(3)}`,
                  `Severity: ${selected.severity}`,
                  `Transactions: ${selected.transactionCount.toLocaleString()}`,
                ]
              : undefined
          }
        />
      )}
    </Card>
  );
}
