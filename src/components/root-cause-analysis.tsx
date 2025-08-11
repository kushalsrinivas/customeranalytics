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
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import type { AnomalousFeature } from "@/types/anomaly";
import { AiInsightSheet } from "@/components/ai-insight-sheet";

export function RootCauseAnalysis({
  features,
}: {
  features: AnomalousFeature[];
}) {
  const top = features.slice().sort((a, b) => b.contribution - a.contribution);
  const rootCauses = top.slice(0, 3).map((f) => ({
    category: f.name,
    description: `Deviation on ${f.name} with z=${f.zScore.toFixed(2)}`,
    confidence: Math.min(1, f.contribution / 100 + 0.3),
    impact: f.severity >= 4 ? "high" : f.severity >= 3 ? "medium" : "low",
    details: `Observed ${f.value.toFixed(
      2
    )} vs normal ${f.normalRange[0].toFixed(2)} - ${f.normalRange[1].toFixed(
      2
    )}`,
  }));

  const patterns = top.slice(0, 3).map((f) => ({
    pattern: `${f.name} pattern`,
    frequency: Math.max(5, Math.round(f.contribution / 5)),
    riskScore: Math.min(0.99, f.contribution / 100 + f.severity / 10),
  }));

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{
    type: "cause" | "pattern";
    label: string;
    value: string;
  } | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Root Cause Attribution
        </CardTitle>
        <CardDescription>
          AI-powered analysis of anomaly drivers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Primary Causes</h4>
          <div className="space-y-3">
            {rootCauses.map((cause, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted/30"
                onClick={() => {
                  setSelected({
                    type: "cause",
                    label: cause.category,
                    value: `${Math.round(cause.confidence * 100)}% confidence`,
                  });
                  setOpen(true);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{cause.category}</div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        cause.impact === "high"
                          ? "destructive"
                          : cause.impact === "medium"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {cause.impact} impact
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(cause.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {cause.description}
                </p>
                <p className="text-xs text-muted-foreground">{cause.details}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Recurring Risk Patterns</h4>
          <div className="space-y-2">
            {patterns.map((pattern, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/30"
                onClick={() => {
                  setSelected({
                    type: "pattern",
                    label: pattern.pattern,
                    value: `Risk ${pattern.riskScore.toFixed(2)}`,
                  });
                  setOpen(true);
                }}
              >
                <div>
                  <div className="font-medium text-sm">{pattern.pattern}</div>
                  <div className="text-xs text-muted-foreground">
                    {pattern.frequency} occurrences
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pattern.riskScore > 0.8 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm font-medium">
                    {pattern.riskScore.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <AiInsightSheet
          open={open}
          onOpenChange={setOpen}
          title={selected ? `Driver: ${selected.label}` : "Driver"}
          subtitle={selected?.value}
          context={{ type: selected?.type ?? "driver", value: selected?.value }}
          staticPoints={
            selected
              ? [
                  `Selected: ${selected.label}`,
                  `Metric: ${selected.value}`,
                  "Observation: placeholder driver observation",
                ]
              : undefined
          }
        />
      </CardContent>
    </Card>
  );
}
