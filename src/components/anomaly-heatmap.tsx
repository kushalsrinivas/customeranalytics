"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CategoryDistributionItem, RegionDistributionItem } from "@/types/anomaly"

export function AnomalyHeatmap({
  regions = [],
  categories = [],
}: {
  regions?: RegionDistributionItem[]
  categories?: CategoryDistributionItem[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anomaly Heatmap</CardTitle>
        <CardDescription>Geographic and categorical distribution of anomalies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regional Heatmap */}
          <div>
            <h4 className="font-medium mb-4">Regional Distribution</h4>
            <div className="space-y-3">
              {regions.map((region, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: `hsl(${Math.max(0, 120 - region.rate)}, 70%, 50%)`,
                      }}
                    />
                    <span className="font-medium">{region.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{region.anomalies} anomalies</div>
                    <div className="text-xs text-muted-foreground">{region.rate.toFixed(1)}% rate</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Heatmap */}
          <div>
            <h4 className="font-medium mb-4">Product Categories</h4>
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: `hsl(${Math.max(0, 120 - category.rate)}, 70%, 50%)`,
                      }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">{category.anomalies}</div>
                      <div className="text-xs text-muted-foreground">{category.rate.toFixed(1)}%</div>
                    </div>
                    <Badge
                      variant={
                        category.trend === 'up'
                          ? 'destructive'
                          : category.trend === 'down'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {category.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
