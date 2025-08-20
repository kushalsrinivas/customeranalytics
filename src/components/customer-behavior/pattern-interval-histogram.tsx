"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BehaviorPattern } from "@/types/customer-behavior";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useComponentInsights } from "@/hooks/use-component-insights";

interface PatternIntervalHistogramProps {
  patterns: BehaviorPattern[];
  metric: "recency" | "frequency" | "avg_order_value";
  title?: string;
  description?: string;
}

export function PatternIntervalHistogram({
  patterns,
  metric,
  title,
  description,
}: PatternIntervalHistogramProps) {
  const chartInsights = useComponentInsights({
    componentType: "Histogram Chart",
    componentId: `pattern-histogram-${metric}`,
    data: {
      patterns: patterns,
      metric: metric,
      totalCustomers: patterns?.length || 0,
      title: title,
      avgValue:
        patterns?.reduce((sum, p) => sum + p[metric], 0) /
        (patterns?.length || 1),
      minValue: patterns?.length
        ? Math.min(...patterns.map((p) => p[metric]))
        : 0,
      maxValue: patterns?.length
        ? Math.max(...patterns.map((p) => p[metric]))
        : 0,
    },
    generateInsights: (data) => {
      const insights = [];
      if (data.totalCustomers > 0) {
        insights.push(
          `Analyzing ${data.metric} distribution for ${data.totalCustomers} customers`
        );

        if (data.metric === "recency") {
          if (data.avgValue < 30) {
            insights.push(
              "Most customers have purchased recently - good engagement"
            );
          } else if (data.avgValue > 90) {
            insights.push(
              "Many customers haven't purchased in a while - re-engagement needed"
            );
          } else {
            insights.push(
              "Mixed recency patterns - some recent, some dormant customers"
            );
          }
          insights.push(
            `Average days since last purchase: ${data.avgValue.toFixed(0)}`
          );
        } else if (data.metric === "frequency") {
          if (data.avgValue > 5) {
            insights.push(
              "High purchase frequency - customers are very engaged"
            );
          } else if (data.avgValue < 2) {
            insights.push(
              "Low purchase frequency - opportunity for engagement campaigns"
            );
          } else {
            insights.push("Moderate purchase frequency across customer base");
          }
          insights.push(
            `Average purchases per month: ${data.avgValue.toFixed(1)}`
          );
        } else if (data.metric === "avg_order_value") {
          if (data.avgValue > 100) {
            insights.push("High average order values - valuable customer base");
          } else if (data.avgValue < 50) {
            insights.push("Lower order values - opportunity for upselling");
          } else {
            insights.push("Moderate order values with potential for growth");
          }
          insights.push(`Average order value: $${data.avgValue.toFixed(2)}`);
        }

        const range = data.maxValue - data.minValue;
        if (range > data.avgValue * 2) {
          insights.push(
            "High variability in customer behavior - consider segmentation"
          );
        } else {
          insights.push("Consistent behavior patterns across customer base");
        }
      } else {
        insights.push("No customer data available for analysis");
      }
      return insights;
    },
    metadata: {
      title:
        title ||
        `${metric.charAt(0).toUpperCase() + metric.slice(1)} Distribution`,
      description: description || `Customer ${metric} analysis`,
      value: patterns?.length ? `${patterns.length} customers` : "No data",
    },
  });
  // Validate and filter patterns data
  const validPatterns =
    patterns?.filter(
      (pattern) =>
        pattern && typeof pattern[metric] === "number" && pattern[metric] >= 0
    ) || [];

  // Create histogram bins
  const createHistogramData = () => {
    if (validPatterns.length === 0) return [];

    const values = validPatterns.map((p) => p[metric]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(
      20,
      Math.max(5, Math.floor(Math.sqrt(values.length)))
    );
    const binSize = (max - min) / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${Math.round(min + i * binSize)}-${Math.round(
        min + (i + 1) * binSize
      )}`,
      count: 0,
      minValue: min + i * binSize,
      maxValue: min + (i + 1) * binSize,
    }));

    // Fill bins with data
    values.forEach((value) => {
      const binIndex = Math.min(
        binCount - 1,
        Math.floor((value - min) / binSize)
      );
      bins[binIndex].count++;
    });

    return bins;
  };

  const histogramData = createHistogramData();
  const average =
    validPatterns.length > 0
      ? validPatterns.reduce((sum, p) => sum + p[metric], 0) /
        validPatterns.length
      : 0;

  const getMetricLabel = () => {
    switch (metric) {
      case "recency":
        return "Days Since Last Purchase";
      case "frequency":
        return "Purchase Frequency (per month)";
      case "avg_order_value":
        return "Average Order Value ($)";
      default:
        return metric;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (metric) {
      case "recency":
        return "Purchase Recency Distribution";
      case "frequency":
        return "Purchase Frequency Distribution";
      case "avg_order_value":
        return "Order Value Distribution";
      default:
        return "Pattern Distribution";
    }
  };

  const getDescription = () => {
    if (description) return description;
    switch (metric) {
      case "recency":
        return "Distribution of days since last purchase across customers";
      case "frequency":
        return "Distribution of purchase frequency across customers";
      case "avg_order_value":
        return "Distribution of average order values across customers";
      default:
        return "Distribution analysis of customer behavior patterns";
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{getMetricLabel()}</p>
          <p className="text-sm text-muted-foreground">Range: {data.range}</p>
          <p className="text-sm text-muted-foreground">
            Customers: {data.count}
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: {((data.count / validPatterns.length) * 100).toFixed(1)}
            %
          </p>
        </div>
      );
    }
    return null;
  };

  // Show empty state if no valid data
  if (histogramData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">No pattern data available</p>
              <p className="text-sm">
                Data will appear here once customer patterns are loaded
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      {...chartInsights.getClickProps()}
    >
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={histogramData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                angle={-45}
                textAnchor="end"
                height={80}
                label={{
                  value: getMetricLabel(),
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                label={{
                  value: "Number of Customers",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <ReferenceLine
                x={average}
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Avg: ${average.toFixed(1)}`,
                  position: "topLeft",
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Customers</p>
            <p className="text-lg font-semibold">{validPatterns.length}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">
              Average {metric === "avg_order_value" ? "Value" : metric}
            </p>
            <p className="text-lg font-semibold">
              {metric === "avg_order_value"
                ? `$${average.toFixed(0)}`
                : average.toFixed(1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Distribution Range</p>
            <p className="text-lg font-semibold">
              {validPatterns.length > 0
                ? `${Math.min(...validPatterns.map((p) => p[metric])).toFixed(
                    0
                  )} - ${Math.max(
                    ...validPatterns.map((p) => p[metric])
                  ).toFixed(0)}`
                : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
