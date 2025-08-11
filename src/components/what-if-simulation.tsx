"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, RotateCcw } from 'lucide-react'
import type { BaselineFeatureStats, CustomerFeatureSnapshot } from "@/types/anomaly"

export function WhatIfSimulation({
  customer,
  baseline,
  currentScore,
}: {
  customer: CustomerFeatureSnapshot
  baseline: BaselineFeatureStats[]
  currentScore: number
}) {
  const [productCount, setProductCount] = useState([customer.featureValues.uniqueProducts])
  const [avgSpend, setAvgSpend] = useState([Math.round(customer.featureValues.avgAmount)])
  const [frequency, setFrequency] = useState([customer.featureValues.transactionCount])
  const [location, setLocation] = useState([1])
  const [simulatedScore, setSimulatedScore] = useState(currentScore)

  const runSimulation = () => {
    // Simulate score calculation based on adjusted parameters
    let newScore = currentScore
    
    // Product count impact
    const baselineProducts = baseline.find(b => b.name === 'uniqueProducts')
    if (baselineProducts) {
      const mean = baselineProducts.mean
      if (productCount[0] > mean * 1.3) newScore -= 0.15
      if (productCount[0] < Math.max(1, mean * 0.7)) newScore += 0.12
    }
    
    // Spend impact  
    const baselineAvg = baseline.find(b => b.name === 'avgAmount')
    if (baselineAvg) {
      if (avgSpend[0] > baselineAvg.mean * 1.5) newScore += 0.08
      if (avgSpend[0] < Math.max(1, baselineAvg.mean * 0.5)) newScore -= 0.10
    }
    
    // Frequency impact
    const baselineFreq = baseline.find(b => b.name === 'transactionCount')
    if (baselineFreq) {
      if (frequency[0] > baselineFreq.mean * 1.4) newScore -= 0.05
      if (frequency[0] < Math.max(1, baselineFreq.mean * 0.6)) newScore += 0.07
    }
    
    // Location impact
    if (location[0] > 2) newScore += 0.20
    
    setSimulatedScore(Math.max(0, Math.min(1, newScore)))
  }

  const resetSimulation = () => {
    setProductCount([customer.featureValues.uniqueProducts])
    setAvgSpend([Math.round(customer.featureValues.avgAmount)])
    setFrequency([customer.featureValues.transactionCount])
    setLocation([1])
    setSimulatedScore(currentScore)
  }

  const scenarios = [
    {
      name: "Increase Product Diversity",
      description: "Customer starts buying from 5 more product categories",
      impact: -0.18,
      confidence: 0.89
    },
    {
      name: "Reduce Transaction Frequency", 
      description: "Customer reduces purchases below segment mean",
      impact: +0.12,
      confidence: 0.76
    },
    {
      name: "Geographic Consistency",
      description: "All purchases from primary location only",
      impact: -0.25,
      confidence: 0.94
    },
    {
      name: "Payment Method Standardization",
      description: "Customer uses only primary payment method",
      impact: -0.08,
      confidence: 0.67
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>What-If Simulation Engine</CardTitle>
          <CardDescription>Adjust customer features to see impact on anomaly score</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current vs Simulated Score */}
          <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-muted-foreground">{currentScore.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Current Score</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-2xl font-bold ${
                simulatedScore < currentScore ? "text-green-600" : 
                simulatedScore > currentScore ? "text-red-600" : "text-muted-foreground"
              }`}>
                {simulatedScore.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Simulated Score</div>
            </div>
          </div>

          {/* Parameter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Product Count</span>
                  <span className="text-sm text-muted-foreground">{productCount[0]}</span>
                </div>
                <Slider
                  value={productCount}
                  onValueChange={setProductCount}
                  max={30}
                  min={5}
                  step={1}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Avg Spend ($)</span>
                  <span className="text-sm text-muted-foreground">{avgSpend[0]}</span>
                </div>
                <Slider
                  value={avgSpend}
                  onValueChange={setAvgSpend}
                  max={500}
                  min={50}
                  step={5}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Purchase Frequency</span>
                  <span className="text-sm text-muted-foreground">{frequency[0]}/month</span>
                </div>
                <Slider
                  value={frequency}
                  onValueChange={setFrequency}
                  max={25}
                  min={1}
                  step={1}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Location Variety</span>
                  <span className="text-sm text-muted-foreground">{location[0]} locations</span>
                </div>
                <Slider
                  value={location}
                  onValueChange={setLocation}
                  max={5}
                  min={1}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3">
            <Button onClick={runSimulation} className="gap-2">
              <Play className="h-4 w-4" />
              Run Simulation
            </Button>
            <Button variant="outline" onClick={resetSimulation} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Analysis</CardTitle>
          <CardDescription>Pre-built scenarios and their predicted impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenarios.map((scenario, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{scenario.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={scenario.impact < 0 ? "default" : "destructive"}>
                      {scenario.impact > 0 ? "+" : ""}{scenario.impact.toFixed(2)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(scenario.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                <div className="flex items-center justify-between">
                  <Progress 
                    value={Math.abs(scenario.impact) * 100} 
                    className="flex-1 mr-4 h-2"
                  />
                  <Button size="sm" variant="outline">Apply Scenario</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
