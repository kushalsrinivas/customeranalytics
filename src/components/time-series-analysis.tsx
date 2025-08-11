"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import type { TimeSeriesPoint } from "@/types/anomaly";

export function TimeSeriesAnalysis({
  timeRange,
  data = [],
}: {
  timeRange: number;
  data?: TimeSeriesPoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time-Series Trend Analysis</CardTitle>
        <CardDescription>
          Behavioral drift detection over {timeRange} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No time-series data available for the selected range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={12} />
                <YAxis
                  yAxisId="left"
                  domain={[0, 1]}
                  allowDecimals
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                />
                <YAxis yAxisId="right" orientation="right" allowDecimals />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="anomalyScore"
                  stroke="#ef4444"
                  fill="#ef444420"
                  name="Anomaly Score"
                  yAxisId="left"
                  dot={data.length <= 2}
                  isAnimationActive={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="transactionCount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Transaction Count"
                  yAxisId="right"
                  dot={data.length <= 2}
                  isAnimationActive={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
