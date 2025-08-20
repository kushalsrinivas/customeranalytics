"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnomalyKPI } from "@/types/anomaly";
import { AiInsightSheet } from "@/components/ai-insight-sheet";
import { useComponentInsights } from "@/hooks/use-component-insights";

export function KpiTiles({
  kpis,
  isLoading,
}: {
  kpis: AnomalyKPI | null;
  isLoading?: boolean;
}) {
  if (!kpis) return null;

  const tiles = [
    {
      label: "Anomaly Rate",
      value: `${kpis.anomalyRate.toFixed(1)}%`,
      subtitle: "Of total customers",
    },
    {
      label: "High Severity",
      value: `${kpis.highSeverityCount}`,
      subtitle: "Severity 4-5",
    },
    {
      label: "Top Feature",
      value: kpis.topAnomalousFeature || "N/A",
      subtitle: "Most frequent deviation",
    },
    {
      label: "Mean Score",
      value: kpis.meanAnomalyScore.toFixed(3),
      subtitle: "Avg anomaly score",
    },
    {
      label: "New Anomalies",
      value: `${kpis.newAnomalies24h}`,
      subtitle: "Last 24h",
    },
  ] as const;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{
    label: string;
    value: string;
    subtitle?: string;
  } | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {tiles.map((tile) => {
        const kpiInsights = useComponentInsights({
          componentType: "Anomaly KPI Tile",
          componentId: `anomaly-kpi-${tile.label
            .toLowerCase()
            .replace(/\s+/g, "-")}`,
          data: {
            value: tile.value,
            label: tile.label,
            subtitle: tile.subtitle,
            rawValue:
              tile.label === "Anomaly Rate"
                ? kpis.anomalyRate
                : tile.label === "High Severity"
                ? kpis.highSeverityCount
                : tile.label === "Mean Score"
                ? kpis.meanAnomalyScore
                : tile.label === "New Anomalies"
                ? kpis.newAnomalies24h
                : 0,
          },
          generateInsights: (data) => {
            const insights = [];
            if (tile.label === "Anomaly Rate") {
              if (data.rawValue > 10) {
                insights.push(
                  "High anomaly rate detected - requires immediate investigation"
                );
                insights.push(
                  "Consider implementing automated alerts for anomaly spikes"
                );
              } else if (data.rawValue > 5) {
                insights.push("Moderate anomaly rate - monitor for trends");
              } else {
                insights.push("Low anomaly rate - system operating normally");
              }
            } else if (tile.label === "High Severity") {
              if (data.rawValue > 10) {
                insights.push(
                  "Multiple high-severity anomalies require urgent attention"
                );
                insights.push("Prioritize investigation of severity 4-5 cases");
              } else if (data.rawValue > 0) {
                insights.push(
                  `${data.rawValue} high-severity anomalies need review`
                );
              } else {
                insights.push("No high-severity anomalies detected");
              }
            } else if (tile.label === "Top Feature") {
              insights.push(`Most anomalous feature: ${data.value}`);
              insights.push(
                "Focus investigation on this feature's behavior patterns"
              );
            } else if (tile.label === "Mean Score") {
              if (data.rawValue > 0.5) {
                insights.push(
                  "High average anomaly score indicates systemic issues"
                );
              } else {
                insights.push("Average anomaly score within normal range");
              }
            } else if (tile.label === "New Anomalies") {
              if (data.rawValue > 5) {
                insights.push("High number of new anomalies in last 24h");
                insights.push(
                  "Investigate potential root causes for recent spike"
                );
              } else {
                insights.push("Normal level of new anomaly detection");
              }
            }
            return insights;
          },
          metadata: {
            title: tile.label,
            description: tile.subtitle,
            value: tile.value,
          },
        });

        return (
          <Card
            key={tile.label}
            onClick={(e) => {
              // Handle component insights
              kpiInsights.handleClick(e);

              // Only open the old sheet if not in multi-select mode
              const isShiftPressed = e.shiftKey;
              if (!isShiftPressed) {
                setSelected(tile);
                setOpen(true);
              }
            }}
            className="cursor-pointer transition hover:bg-muted/40 hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {tile.label}
                <Badge variant="outline" className="text-[10px]">
                  KPI
                </Badge>
              </CardTitle>
              <CardDescription>{tile.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tile.value}</div>
            </CardContent>
          </Card>
        );
      })}

      <AiInsightSheet
        open={open}
        onOpenChange={setOpen}
        title={selected ? `Insights: ${selected.label}` : "Insights"}
        subtitle={selected?.subtitle}
        context={{ type: "KPI", value: selected?.value }}
        staticPoints={
          selected
            ? [
                `Current value: ${selected.value}`,
                `About: ${selected.subtitle ?? "N/A"}`,
                "Observation: placeholder observation",
              ]
            : undefined
        }
      />
    </div>
  );
}
