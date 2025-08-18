"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BehaviorKPI } from "@/types/customer-behavior";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  DollarSign,
  Grid3X3,
  Smartphone,
  AlertTriangle,
} from "lucide-react";

interface BehaviorKpiTilesProps {
  kpis: BehaviorKPI;
}

export function BehaviorKpiTiles({ kpis }: BehaviorKpiTilesProps) {
  const tiles = [
    {
      label: "Avg Purchase Interval",
      value: `${kpis.avgPurchaseInterval} days`,
      icon: Clock,
      trend:
        kpis.avgPurchaseInterval < 30
          ? "up"
          : kpis.avgPurchaseInterval > 60
          ? "down"
          : "stable",
      color: "text-cyan-400",
    },
    {
      label: "Avg Order Value",
      value: `$${kpis.avgOrderValue.toFixed(2)}`,
      icon: DollarSign,
      trend: "up",
      color: "text-green-400",
    },
    {
      label: "Category Diversity",
      value: kpis.categoryDiversity.toFixed(1),
      icon: Grid3X3,
      trend: "stable",
      color: "text-blue-400",
    },
    {
      label: "Channel Mix",
      value: kpis.dominantChannel,
      subtitle: `${kpis.dominantChannelPct.toFixed(1)}%`,
      icon: Smartphone,
      trend: "stable",
      color: "text-purple-400",
    },
    {
      label: "Churn Risk",
      value: `${kpis.churnRiskPct.toFixed(1)}%`,
      icon: AlertTriangle,
      trend: kpis.churnRiskPct > 20 ? "down" : "up",
      color: kpis.churnRiskPct > 20 ? "text-red-400" : "text-green-400",
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-400" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {tiles.map((tile, index) => {
        const IconComponent = tile.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {tile.label}
              </CardTitle>
              <div className="flex items-center gap-1">
                {getTrendIcon(tile.trend)}
                <IconComponent className={`h-4 w-4 ${tile.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tile.value}</div>
              {tile.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {tile.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
