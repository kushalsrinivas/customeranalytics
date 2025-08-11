"use client";

import type { SeverityDistributionItem } from "@/types/anomaly";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <Card>
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
                  onClick={() => onLevelClick?.(s.level)}
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
    </Card>
  );
}
