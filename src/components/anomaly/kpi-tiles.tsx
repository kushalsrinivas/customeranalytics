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
      {tiles.map((tile) => (
        <Card
          key={tile.label}
          onClick={() => {
            setSelected(tile);
            setOpen(true);
          }}
          className="cursor-pointer transition hover:bg-muted/40"
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
      ))}

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
