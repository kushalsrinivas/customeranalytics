"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import type { CustomerComparisonItem } from "@/types/anomaly"

export function CustomerComparison({ items = [] }: { items?: CustomerComparisonItem[] }) {
  const comparisons = items
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer vs Peer Comparison</CardTitle>
        <CardDescription>Behavioral differences from similar customer segment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comparisons.map((comp, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{comp.metric}</span>
                <div className="flex items-center gap-2">
                  {comp.trend === "up" ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : comp.trend === "down" ? (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    comp.trend === "up" ? "text-green-600" : 
                    comp.trend === "down" ? "text-red-600" : "text-gray-600"
                  }`}>
                    {comp.difference > 0 ? "+" : ""}{comp.difference.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-muted-foreground">Customer</div>
                  <div className="font-medium">{comp.customer}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Peer Average</div>
                  <div className="font-medium">{comp.peer}</div>
                </div>
              </div>
              <Progress 
                value={Math.abs(comp.difference)} 
                className={`h-2 ${comp.trend === "up" ? "text-green-500" : "text-red-500"}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
