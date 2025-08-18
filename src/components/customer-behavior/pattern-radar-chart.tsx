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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

interface PatternRadarChartProps {
  patterns: BehaviorPattern[];
  selectedCustomer?: string;
}

export function PatternRadarChart({
  patterns,
  selectedCustomer,
}: PatternRadarChartProps) {
  // Calculate aggregate metrics for the radar chart
  const avgMetrics = patterns.reduce(
    (acc, pattern) => {
      acc.frequency += pattern.frequency;
      acc.recency += pattern.recency;
      acc.value += pattern.avg_order_value;
      acc.quantity += pattern.quantity;
      acc.diversity += pattern.diversity;
      acc.loyalty += pattern.loyalty;
      return acc;
    },
    {
      frequency: 0,
      recency: 0,
      value: 0,
      quantity: 0,
      diversity: 0,
      loyalty: 0,
    }
  );

  const count = patterns.length;
  const normalizeValue = (value: number, max: number) =>
    Math.round((value / max) * 100);

  const radarData = [
    {
      metric: "Frequency",
      average: normalizeValue(avgMetrics.frequency / count, 20),
      selected: selectedCustomer
        ? normalizeValue(
            patterns.find((p) => p.customer_id === selectedCustomer)
              ?.frequency || 0,
            20
          )
        : 0,
    },
    {
      metric: "Recency",
      average: normalizeValue(90 - avgMetrics.recency / count, 90), // Invert recency (lower is better)
      selected: selectedCustomer
        ? normalizeValue(
            90 -
              (patterns.find((p) => p.customer_id === selectedCustomer)
                ?.recency || 90),
            90
          )
        : 0,
    },
    {
      metric: "Order Value",
      average: normalizeValue(avgMetrics.value / count, 1000),
      selected: selectedCustomer
        ? normalizeValue(
            patterns.find((p) => p.customer_id === selectedCustomer)
              ?.avg_order_value || 0,
            1000
          )
        : 0,
    },
    {
      metric: "Quantity",
      average: normalizeValue(avgMetrics.quantity / count, 10),
      selected: selectedCustomer
        ? normalizeValue(
            patterns.find((p) => p.customer_id === selectedCustomer)
              ?.quantity || 0,
            10
          )
        : 0,
    },
    {
      metric: "Diversity",
      average: normalizeValue(avgMetrics.diversity / count, 10),
      selected: selectedCustomer
        ? normalizeValue(
            patterns.find((p) => p.customer_id === selectedCustomer)
              ?.diversity || 0,
            10
          )
        : 0,
    },
    {
      metric: "Loyalty",
      average: normalizeValue(avgMetrics.loyalty / count, 100),
      selected: selectedCustomer
        ? normalizeValue(
            patterns.find((p) => p.customer_id === selectedCustomer)?.loyalty ||
              0,
            100
          )
        : 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Behavior Radar</CardTitle>
        <CardDescription>
          Multi-dimensional view of customer purchase patterns
          {selectedCustomer && ` - Comparing ${selectedCustomer} to average`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={radarData}
              margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
            >
              <PolarGrid />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <Radar
                name="Average"
                dataKey="average"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              {selectedCustomer && (
                <Radar
                  name={selectedCustomer}
                  dataKey="selected"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
