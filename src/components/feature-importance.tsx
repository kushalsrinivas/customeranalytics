"use client";

import { Progress } from "@/components/ui/progress";
import type { AnomalousFeature } from "@/types/anomaly";

export function FeatureImportance({
  features = [],
  customerId,
}: {
  features?: AnomalousFeature[];
  customerId?: string;
}) {
  const impactColor = (f: AnomalousFeature) => {
    if (f.zScore > 0 && f.value > f.normalRange[1]) return "text-red-600";
    if (f.zScore > 0 && f.value < f.normalRange[0]) return "text-blue-600";
    return "text-gray-600";
  };

  return (
    <div className="mt-3 space-y-3">
      <h5 className="text-sm font-medium">Top Feature Contributions</h5>
      {features.slice(0, 5).map((feature, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{feature.name}</span>
            <span className={impactColor(feature)}>
              {feature.contribution.toFixed(0)}%
            </span>
          </div>
          <Progress value={feature.contribution} className="h-1" />
        </div>
      ))}
    </div>
  );
}
