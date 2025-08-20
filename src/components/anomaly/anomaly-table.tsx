"use client";

import { useMemo, useState } from "react";
import type { AnomalyDataPoint } from "@/types/anomaly";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AiInsightSheet } from "@/components/ai-insight-sheet";
import { useComponentInsights } from "@/hooks/use-component-insights";

export function AnomalyTable({
  anomalies,
  maxRows = 15,
  onCustomerClick,
}: {
  anomalies: AnomalyDataPoint[];
  maxRows?: number;
  onCustomerClick?: (a: AnomalyDataPoint) => void;
}) {
  const [sortField, setSortField] =
    useState<keyof AnomalyDataPoint>("anomalyScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AnomalyDataPoint | null>(null);

  const tableInsights = useComponentInsights({
    componentType: "Anomaly Table",
    componentId: "anomaly-table",
    data: {
      totalAnomalies: anomalies.length,
      displayedRows: Math.min(maxRows, anomalies.length),
      sortField,
      sortDirection,
      highSeverityCount: anomalies.filter((a) => a.severity >= 4).length,
      avgScore:
        anomalies.reduce((sum, a) => sum + a.anomalyScore, 0) /
        anomalies.length,
    },
    generateInsights: (data) => {
      const insights = [];
      insights.push(
        `Displaying ${data.displayedRows} of ${data.totalAnomalies} anomalous customers`
      );
      insights.push(
        `${data.highSeverityCount} high-severity (4-5) anomalies require immediate attention`
      );
      insights.push(`Average anomaly score: ${data.avgScore.toFixed(3)}`);

      if (data.sortField === "anomalyScore") {
        insights.push(
          "Sorted by anomaly score - highest risk customers at top"
        );
      } else if (data.sortField === "severity") {
        insights.push(
          "Sorted by severity level - most critical cases prioritized"
        );
      } else if (data.sortField === "totalAmount") {
        insights.push("Sorted by transaction amount - financial impact view");
      }

      const highRiskPct = (data.highSeverityCount / data.totalAnomalies) * 100;
      if (highRiskPct > 20) {
        insights.push(
          "High concentration of severe anomalies - investigate system-wide issues"
        );
      }

      return insights;
    },
    metadata: {
      title: "Top Anomalous Customers",
      description: `${Math.min(maxRows, anomalies.length)} of ${
        anomalies.length
      } anomalies`,
      value: `${anomalies.length} customers`,
    },
  });

  const sorted = useMemo(() => {
    const copy = [...anomalies];
    copy.sort((a, b) => {
      const av = a[sortField] as unknown as number | string;
      const bv = b[sortField] as unknown as number | string;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDirection === "asc" ? av - bv : bv - av;
      }
      return sortDirection === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy.slice(0, maxRows);
  }, [anomalies, sortField, sortDirection, maxRows]);

  const header = (label: string, field: keyof AnomalyDataPoint) => (
    <th
      className="px-3 py-2 text-left text-sm border-b cursor-pointer select-none"
      onClick={() =>
        setSortField((prev) => {
          if (prev === field)
            setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
          return field;
        })
      }
    >
      {label}{" "}
      {sortField === field ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
    </th>
  );

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      {...tableInsights.getClickProps()}
    >
      <CardHeader>
        <CardTitle>Top Anomalous Customers</CardTitle>
        <CardDescription>
          Showing {Math.min(maxRows, anomalies.length)} of {anomalies.length}{" "}
          anomalies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40">
                {header("Customer", "customerName")}
                {header("Score", "anomalyScore")}
                {header("Severity", "severity")}
                {header("Total Amount", "totalAmount")}
                {header("Transactions", "transactionCount")}
                {header("Region", "region")}
                <th className="px-3 py-2 text-left text-sm border-b">
                  Top Features
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a, index) => {
                const rowInsights = useComponentInsights({
                  componentType: "Anomaly Customer Row",
                  componentId: `customer-${a.customerId}`,
                  data: a,
                  generateInsights: (data) => {
                    const insights = [];
                    insights.push(
                      `Customer: ${data.customerName} (ID: ${data.customerId})`
                    );
                    insights.push(
                      `Anomaly score: ${data.anomalyScore.toFixed(
                        3
                      )} (Severity ${data.severity})`
                    );
                    insights.push(
                      `Total transactions: ${data.transactionCount.toLocaleString()} worth $${data.totalAmount.toLocaleString()}`
                    );
                    insights.push(
                      `Location: ${data.region}, ${data.state}, ${data.country}`
                    );

                    const topFeatures = data.features
                      .slice()
                      .sort((x, y) => y.contribution - x.contribution)
                      .slice(0, 3)
                      .map((f) => `${f.name} (${f.contribution.toFixed(1)}%)`)
                      .join(", ");
                    insights.push(`Top anomalous features: ${topFeatures}`);

                    if (data.severity >= 4) {
                      insights.push(
                        "HIGH PRIORITY: Requires immediate investigation"
                      );
                    } else if (data.severity >= 3) {
                      insights.push("MEDIUM PRIORITY: Monitor closely");
                    }

                    if (data.anomalyScore > 0.7) {
                      insights.push("Extremely anomalous behavior detected");
                    } else if (data.anomalyScore > 0.5) {
                      insights.push("Significantly anomalous behavior");
                    }

                    return insights;
                  },
                  metadata: {
                    title: a.customerName,
                    description: `Anomaly Score: ${a.anomalyScore.toFixed(3)}`,
                    value: `Severity ${a.severity}`,
                  },
                });

                return (
                  <tr
                    key={a.customerId}
                    className={
                      (index % 2 === 0 ? "bg-muted/20 " : "") +
                      "cursor-pointer hover:bg-muted/40"
                    }
                    onClick={(e) => {
                      // Handle component insights
                      rowInsights.handleClick(e);

                      // Only open existing functionality if not in multi-select mode
                      const isShiftPressed = e.shiftKey;
                      if (!isShiftPressed) {
                        if (onCustomerClick) onCustomerClick(a);
                        else {
                          setSelected(a);
                          setOpen(true);
                        }
                      }
                    }}
                    data-customer-id={a.customerId}
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium">{a.customerName}</div>
                      <div className="text-xs opacity-70">
                        ID: {a.customerId}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div
                        className={`font-semibold ${
                          a.anomalyScore > 0.5
                            ? "text-fuchsia-500"
                            : "text-cyan-400"
                        }`}
                      >
                        {a.anomalyScore.toFixed(3)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: severityColor(a.severity),
                          color: "#0a1224",
                        }}
                      >
                        Level {a.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium">
                      ${a.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {a.transactionCount.toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <div>{a.region}</div>
                      <div className="text-xs opacity-70">
                        {a.state}, {a.country}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {a.features
                          .slice()
                          .sort((x, y) => y.contribution - x.contribution)
                          .slice(0, 3)
                          .map((f, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-primary"
                              title={`${f.name}: ${f.contribution.toFixed(1)}%`}
                            >
                              {f.name}
                            </span>
                          ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
      {!onCustomerClick && (
        <AiInsightSheet
          open={open}
          onOpenChange={setOpen}
          title={selected ? `Customer: ${selected.customerName}` : "Customer"}
          subtitle={
            selected
              ? `Region ${selected.region} • Severity ${selected.severity}`
              : undefined
          }
          context={{
            type: "customer",
            value: selected?.anomalyScore?.toFixed?.(3),
          }}
          staticPoints={
            selected
              ? [
                  `Anomaly score: ${selected.anomalyScore.toFixed(3)}`,
                  `Total amount: $${selected.totalAmount.toLocaleString()}`,
                  `Top features: ${selected.features
                    .slice()
                    .sort((a, b) => b.contribution - a.contribution)
                    .slice(0, 3)
                    .map((f) => f.name)
                    .join(", ")}`,
                ]
              : undefined
          }
        />
      )}
    </Card>
  );
}

function severityColor(level: number) {
  const colors: Record<number, string> = {
    1: "#00e0ff",
    2: "#5fd4d6",
    3: "#5891cb",
    4: "#aa45dd",
    5: "#e930ff",
  };
  return colors[level] || "#5891cb";
}
