"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SegmentSummaryItem } from "@/types/anomaly";

export function CustomerSegmentation({
  segments = [],
}: {
  segments?: SegmentSummaryItem[];
}) {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Segmentation</CardTitle>
        <CardDescription>
          Behavioral segments with anomaly rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {segments.map((segment, index) => (
            <div
              key={segment.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    colors[index % colors.length]
                  }`}
                />
                <div>
                  <div className="font-medium">{segment.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {segment.count.toLocaleString()} customers
                  </div>
                </div>
              </div>
              <Badge
                variant={
                  segment.anomalyRate > 10
                    ? "destructive"
                    : segment.anomalyRate > 7
                    ? "secondary"
                    : "outline"
                }
              >
                {segment.anomalyRate.toFixed(1)}% anomalous
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
