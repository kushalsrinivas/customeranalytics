"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'
import type { RiskAlertItem } from "@/types/anomaly"

export function RiskScoring({ alerts = [] }: { alerts?: RiskAlertItem[] }) {

  const playbooks = [
    {
      scenario: "High-Value Customer Anomaly",
      template: "Comprehensive investigation with priority escalation",
      usage: 23,
      successRate: 89
    },
    {
      scenario: "Geographic Fraud Pattern",
      template: "Identity verification with transaction monitoring", 
      usage: 45,
      successRate: 94
    },
    {
      scenario: "Behavioral Drift Detection",
      template: "Customer outreach with retention offers",
      usage: 67,
      successRate: 76
    }
  ]

  return (
    <div className="space-y-6">
      {/* Alert Prioritization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alert Prioritization AI
          </CardTitle>
          <CardDescription>ML-ranked anomalies by potential impact and urgency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      alert.priority === "Critical" ? "destructive" : 
                      alert.priority === "High" ? "secondary" : "outline"
                    }>
                      {alert.priority}
                    </Badge>
                    <span className="font-medium">{alert.customer}</span>
                    <Badge variant="outline">{alert.category}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Risk: {alert.riskScore.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Impact: ${alert.impact.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Recommended Actions</h5>
                    <div className="space-y-2">
                      {alert.actions.map((action, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {action.status === "recommended" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                            <span>{action.action}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {Math.round(action.confidence * 100)}%
                            </span>
                            <Button size="sm" variant="outline">Execute</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Time to Act</span>
                      <span className="text-sm text-muted-foreground">{alert.timeToActHours} hours</span>
                    </div>
                    <Progress value={
                      alert.timeToActHours <= 2 ? 90 : alert.timeToActHours <= 6 ? 70 : 30
                    } className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Playbook Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Dynamic Playbook Generator
          </CardTitle>
          <CardDescription>AI-generated investigation templates and response protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {playbooks.map((playbook, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{playbook.scenario}</h4>
                <p className="text-sm text-muted-foreground mb-3">{playbook.template}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Usage: {playbook.usage} times</span>
                    <span>Success: {playbook.successRate}%</span>
                  </div>
                  <Progress value={playbook.successRate} className="h-1" />
                  <Button size="sm" className="w-full">Generate Report</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
