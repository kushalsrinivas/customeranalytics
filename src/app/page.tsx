"use client"

import { useState } from "react"
import { AlertTriangle, TrendingUp, Users, Brain, Target, ChevronRight, Play, Pause } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CustomerSegmentation } from "@/components/customer-segmentation"
import { TimeSeriesAnalysis } from "@/components/time-series-analysis"
import { FeatureImportance } from "@/components/feature-importance"
import { RootCauseAnalysis } from "@/components/root-cause-analysis"
import { CustomerComparison } from "@/components/customer-comparison"
import { RiskScoring } from "@/components/risk-scoring"
// import { WhatIfSimulation } from "@/components/what-if-simulation"
import { AnomalyHeatmap } from "@/components/anomaly-heatmap"
import { ForecastCards } from "@/components/forecast-cards"

export default function AnomalyDetectionDashboard() {
  const [selectedCustomer, setSelectedCustomer] = useState("CUST_001")
  const [timeRange, setTimeRange] = useState([30])
  const [isPlaying, setIsPlaying] = useState(false)

  const anomalousCustomers = [
    {
      id: "CUST_001",
      name: "Sarah Johnson",
      anomalyScore: 0.89,
      riskLevel: "High",
      segment: "High-Value Seasonal",
      lastTransaction: "2024-01-15",
      totalSpend: 15420,
      reasonCode: "Sudden bulk purchase + rare product combo",
      actions: ["Flag for manual review", "Offer retention discount"],
      churnRisk: 0.72
    },
    {
      id: "CUST_002", 
      name: "Michael Chen",
      anomalyScore: 0.76,
      riskLevel: "Medium",
      segment: "Bulk Discounter",
      lastTransaction: "2024-01-14",
      totalSpend: 8930,
      reasonCode: "Location change + payment method switch",
      actions: ["Send fraud alert", "Verify identity"],
      churnRisk: 0.45
    },
    {
      id: "CUST_003",
      name: "Emma Rodriguez",
      anomalyScore: 0.82,
      riskLevel: "High", 
      segment: "Regular Buyer",
      lastTransaction: "2024-01-13",
      totalSpend: 12100,
      reasonCode: "Product variety drop + spend increase",
      actions: ["Generate investigation report", "Contact customer"],
      churnRisk: 0.68
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Customer Anomaly Detection</h1>
              <p className="text-muted-foreground">Advanced Analytics & Prescriptive Insights</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant={isPlaying ? "secondary" : "default"}
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Live"} Monitoring
              </Button>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anomalousCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Anomalies</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Segments</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Behavioral clusters identified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.73</div>
              <p className="text-xs text-muted-foreground">-5% improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Prevention</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">Success rate this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
            <TabsTrigger value="prescriptive">Prescriptive</TabsTrigger>
            <TabsTrigger value="predictive">Predictive</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CustomerSegmentation />
              <TimeSeriesAnalysis timeRange={timeRange[0]} />
            </div>
            
            <AnomalyHeatmap />

            {/* Customer List with Expandable Details */}
            <Card>
              <CardHeader>
                <CardTitle>Anomalous Customers</CardTitle>
                <CardDescription>Customers flagged by the anomaly detection system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {anomalousCustomers.map((customer) => (
                  <Collapsible key={customer.id}>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.id}</div>
                        </div>
                        <Badge variant={customer.riskLevel === "High" ? "destructive" : "secondary"}>
                          {customer.riskLevel} Risk
                        </Badge>
                        <Badge variant="outline">{customer.segment}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Score: {customer.anomalyScore}</div>
                        <div className="text-sm text-muted-foreground">${customer.totalSpend.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <CollapsibleContent className="px-4 pb-4">
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Why Anomalous?</h4>
                            <p className="text-sm text-muted-foreground">{customer.reasonCode}</p>
                            <FeatureImportance features={[]} customerId={customer.id} />
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Recommended Actions</h4>
                            <div className="space-y-2">
                              {customer.actions.map((action, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm">{action}</span>
                                  <Button size="sm" variant="outline">Execute</Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Churn Risk</span>
                            <span className="text-sm">{Math.round(customer.churnRisk * 100)}%</span>
                          </div>
                          <Progress value={customer.churnRisk * 100} className="h-2" />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnostic Tab */}
          <TabsContent value="diagnostic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RootCauseAnalysis features={[]} />
              <CustomerComparison items={[]} />
            </div>
          </TabsContent>

          {/* Prescriptive Tab */}
          <TabsContent value="prescriptive" className="space-y-6">
            <RiskScoring />
          </TabsContent>

          {/* Predictive Tab */}
          <TabsContent value="predictive" className="space-y-6">
            <ForecastCards />
          </TabsContent>

          {/* Simulation Tab */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Use the Anomaly page to run what-if simulations with live database data.
            </div>
          </TabsContent>
        </Tabs>

        {/* Time Range Control */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Timeline Control
            </CardTitle>
            <CardDescription>Adjust the analysis time window</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Time Range:</span>
                <span className="text-sm text-muted-foreground">{timeRange[0]} days</span>
              </div>
              <Slider
                value={timeRange}
                onValueChange={setTimeRange}
                max={365}
                min={7}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>7 days</span>
                <span>1 year</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
