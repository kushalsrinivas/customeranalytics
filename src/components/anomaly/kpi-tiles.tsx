"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnomalyKPI } from "@/types/anomaly";

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {tiles.map((tile) => (
        <Card key={tile.label}>
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
    </div>
  );
}
