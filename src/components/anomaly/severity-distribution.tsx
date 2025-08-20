"use client";

import { useState } from "react";
import type { SeverityDistributionItem } from "@/types/anomaly";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AiInsightSheet } from "@/components/ai-insight-sheet";
import { useComponentInsights } from "@/hooks/use-component-insights";

export function SeverityDistribution({
  data,
  onLevelClick,
  isLoading,
}: {
  data: SeverityDistributionItem[];
  onLevelClick?: (level: number) => void;
  isLoading?: boolean;
}) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anomaly Severity Distribution</CardTitle>
          <CardDescription>No anomaly data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SeverityDistributionItem | null>(
    null
  );

  const chartInsights = useComponentInsights({
    componentType: "Severity Distribution Chart",
    componentId: "severity-distribution-chart",
    data: {
      severityData: data,
      totalAnomalies: total,
      maxCount: maxCount,
      highSeverityCount: data
        .filter((d) => d.level >= 4)
        .reduce((sum, d) => sum + d.count, 0),
      criticalCount: data.find((d) => d.level === 5)?.count || 0,
    },
    generateInsights: (data) => {
      const insights = [];
      if (data.totalAnomalies > 0) {
        insights.push(`Total anomalies detected: ${data.totalAnomalies}`);

        const highSeverityPct =
          (data.highSeverityCount / data.totalAnomalies) * 100;
        if (highSeverityPct > 30) {
          insights.push(
            `HIGH ALERT: ${highSeverityPct.toFixed(
              1
            )}% are high-severity (Level 4-5) anomalies`
          );
        } else if (highSeverityPct > 15) {
          insights.push(
            `${highSeverityPct.toFixed(
              1
            )}% are high-severity anomalies - monitor closely`
          );
        } else {
          insights.push(
            `${highSeverityPct.toFixed(
              1
            )}% are high-severity - manageable level`
          );
        }

        if (data.criticalCount > 0) {
          insights.push(
            `${data.criticalCount} critical (Level 5) anomalies require immediate action`
          );
        }

        const dominantLevel = data.severityData.reduce((max, current) =>
          current.count > max.count ? current : max
        );
        insights.push(
          `Most common severity: Level ${dominantLevel.level} (${dominantLevel.count} cases)`
        );

        insights.push(
          "Click on severity levels to drill down into specific cases"
        );
      } else {
        insights.push("No anomalies detected in current time period");
      }
      return insights;
    },
    metadata: {
      title: "Anomaly Severity Distribution",
      description: "Distribution of anomalies by severity level",
      value: `${total} anomalies`,
    },
  });

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      {...chartInsights.getClickProps()}
    >
      <CardHeader>
        <CardTitle>Anomaly Severity Distribution</CardTitle>
        <CardDescription>{total} total anomalies detected</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col-reverse items-center gap-2 mb-6">
          {data
            .slice()
            .sort((a, b) => a.level - b.level)
            .map((s) => {
              const widthPct = (s.count / maxCount) * 100;
              return (
                <button
                  key={s.level}
                  onClick={() => {
                    onLevelClick?.(s.level);
                    setSelected(s);
                    setOpen(true);
                  }}
                  className="relative h-12 rounded-md border transition-all focus:outline-none"
                  style={{
                    width: `${Math.max(widthPct, 10)}%`,
                    backgroundColor: s.color,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="text-center text-white font-semibold text-sm">
                    <div className="text-base">{s.count.toLocaleString()}</div>
                    <div className="text-xs opacity-90">
                      {s.percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="absolute left-2 top-1 text-xs font-bold text-white/90">
                    L{s.level}
                  </div>
                </button>
              );
            })}
        </div>
      </CardContent>
      <AiInsightSheet
        open={open}
        onOpenChange={setOpen}
        title={selected ? `Severity Level ${selected.level}` : "Severity"}
        subtitle={
          selected
            ? `${selected.count} anomalies • ${selected.percentage.toFixed(1)}%`
            : undefined
        }
        context={{
          type: "severity",
          value: selected?.percentage?.toFixed?.(1),
        }}
        staticPoints={
          selected
            ? [
                `Count: ${selected.count.toLocaleString()}`,
                `Share: ${selected.percentage.toFixed(1)}% of total`,
                "Observation: placeholder severity observation",
              ]
            : undefined
        }
      />
    </Card>
  );
}
