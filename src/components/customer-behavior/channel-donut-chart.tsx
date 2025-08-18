"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChannelUsage } from "@/types/customer-behavior";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface ChannelDonutChartProps {
  channels: ChannelUsage[];
  highlightChannel?: string;
}

export function ChannelDonutChart({
  channels,
  highlightChannel,
}: ChannelDonutChartProps) {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const chartData = channels.map((channel, index) => ({
    name: channel.channel,
    value: channel.percentage,
    count: channel.count,
    spend: channel.spend,
    color: colors[index % colors.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toFixed(1)}% of transactions
          </p>
          <p className="text-sm text-muted-foreground">
            {data.count.toLocaleString()} transactions
          </p>
          <p className="text-sm text-muted-foreground">
            ${data.spend.toLocaleString()} spent
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--background))"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const dominantChannel = channels.reduce((max, channel) =>
    channel.percentage > max.percentage ? channel : max
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Distribution</CardTitle>
        <CardDescription>
          Customer purchase behavior across channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {dominantChannel.channel}
            </div>
            <div className="text-sm text-muted-foreground">
              Dominant Channel ({dominantChannel.percentage.toFixed(1)}%)
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={
                      highlightChannel === entry.name
                        ? "hsl(var(--primary))"
                        : "none"
                    }
                    strokeWidth={highlightChannel === entry.name ? 3 : 0}
                    opacity={
                      highlightChannel
                        ? highlightChannel === entry.name
                          ? 1
                          : 0.6
                        : 1
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          {channels.map((channel, index) => (
            <div
              key={channel.channel}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm font-medium">{channel.channel}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  {channel.percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  ${(channel.spend / 1000).toFixed(0)}k
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
