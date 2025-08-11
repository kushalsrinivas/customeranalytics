"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
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
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="anomalyScore"
                stroke="#ef4444"
                fill="#ef444420"
                name="Anomaly Score"
              />
              <Line
                type="monotone"
                dataKey="transactionCount"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Transaction Count"
                yAxisId="right"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
