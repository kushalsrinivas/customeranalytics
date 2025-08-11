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
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, Users } from "lucide-react";
import type {
  ForecastOverviewItem,
  PerCustomerForecastItem,
} from "@/types/anomaly";
import { AiInsightSheet } from "@/components/ai-insight-sheet";

export function ForecastCards({
  overview = [],
  forecasts = [],
  riskFactors = [],
}: {
  overview?: ForecastOverviewItem[];
  forecasts?: PerCustomerForecastItem[];
  riskFactors?: {
    factor: string;
    weight: number;
    impact: "High" | "Medium" | "Low";
  }[];
}) {
  const iconMap = { AlertTriangle, TrendingDown, TrendingUp, Users } as const;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<
    | { kind: "overview"; item: ForecastOverviewItem }
    | { kind: "forecast"; item: PerCustomerForecastItem }
    | null
  >(null);
  return (
    <div className="space-y-6">
      {/* Prediction Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {overview.map((pred, index) => {
          const Icon = iconMap[pred.icon];
          return (
            <Card
              key={index}
              onClick={() => {
                setSelected({ kind: "overview", item: pred });
                setOpen(true);
              }}
              className="cursor-pointer hover:bg-muted/40"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {pred.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${pred.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pred.value}</div>
                <p
                  className={`text-xs ${
                    pred.change > 0
                      ? "text-red-500"
                      : pred.change < 0
                      ? "text-green-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {pred.change === 0
                    ? "No change vs prior week"
                    : `${pred.change > 0 ? "+" : ""}${
                        pred.change
                      } vs prior week`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Individual Forecast Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Future Anomaly Forecasting</CardTitle>
          <CardDescription>
            ML-powered predictions of customer anomaly scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {forecasts.map((forecast, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-4 cursor-pointer hover:bg-muted/30"
                onClick={() => {
                  setSelected({ kind: "forecast", item: forecast });
                  setOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{forecast.customer}</h4>
                  <Badge
                    variant={
                      forecast.trend === "increasing"
                        ? "destructive"
                        : forecast.trend === "decreasing"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {forecast.trend}
                  </Badge>
                </div>

                {/* Score Timeline */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Current
                    </span>
                    <span className="font-medium">
                      {forecast.currentScore.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Next Week
                    </span>
                    <span
                      className={`font-medium ${
                        forecast.nextWeekScore > forecast.currentScore
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {forecast.nextWeekScore.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Next Month
                    </span>
                    <span
                      className={`font-medium ${
                        forecast.nextMonthScore > forecast.currentScore
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {forecast.nextMonthScore.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Churn Risk */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Churn Risk</span>
                    <span className="text-sm">
                      {Math.round(forecast.churnRisk * 100)}%
                    </span>
                  </div>
                  <Progress value={forecast.churnRisk * 100} className="h-2" />
                </div>

                {/* Confidence */}
                <div className="text-center">
                  <span className="text-xs text-muted-foreground">
                    Prediction Confidence:{" "}
                    {Math.round(forecast.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Churn Prediction Model */}
      <Card>
        <CardHeader>
          <CardTitle>Churn Prediction Analysis</CardTitle>
          <CardDescription>
            Combined anomaly scores with churn risk modeling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Risk Factors</h4>
              <div className="space-y-3">
                {riskFactors.map((factor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{factor.factor}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          factor.impact === "High"
                            ? "destructive"
                            : factor.impact === "Medium"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {factor.impact}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(factor.weight * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Model Performance</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Accuracy</span>
                    <span className="text-sm font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Precision</span>
                    <span className="text-sm font-medium">89.7%</span>
                  </div>
                  <Progress value={89.7} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Recall</span>
                    <span className="text-sm font-medium">91.3%</span>
                  </div>
                  <Progress value={91.3} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">F1 Score</span>
                    <span className="text-sm font-medium">90.5%</span>
                  </div>
                  <Progress value={90.5} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <AiInsightSheet
        open={open}
        onOpenChange={setOpen}
        title={
          selected
            ? selected.kind === "overview"
              ? `Forecast KPI: ${selected.item.title}`
              : `Forecast: ${selected.item.customer}`
            : "Forecast Insight"
        }
        subtitle={
          selected && selected.kind === "overview"
            ? selected.item.value
            : undefined
        }
        context={{
          type: selected?.kind ?? "forecast",
          value:
            selected && selected.kind === "overview"
              ? selected.item.value
              : selected && selected.kind === "forecast"
              ? selected.item.nextWeekScore.toFixed(2)
              : undefined,
        }}
        staticPoints={
          selected
            ? selected.kind === "overview"
              ? [
                  `Value: ${selected.item.value}`,
                  `Change vs prior: ${selected.item.change}`,
                  "Observation: placeholder forecast KPI observation",
                ]
              : [
                  `Current: ${selected.item.currentScore.toFixed(2)}`,
                  `Next week: ${selected.item.nextWeekScore.toFixed(2)}`,
                  `Next month: ${selected.item.nextMonthScore.toFixed(2)}`,
                ]
            : undefined
        }
      />
    </div>
  );
}
