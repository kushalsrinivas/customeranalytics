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
    <Card>
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
              {sorted.map((a, index) => (
                <tr
                  key={a.customerId}
                  className={index % 2 === 0 ? "bg-muted/20" : ""}
                  onClick={() => onCustomerClick?.(a)}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium">{a.customerName}</div>
                    <div className="text-xs opacity-70">ID: {a.customerId}</div>
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
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
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
