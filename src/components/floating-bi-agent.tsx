"use client";

import { BIAgentPopup } from "./bi-agent-popup";
import { createCustomerBehaviorConfig } from "./bi-agent/customer-behavior-config";
import { createAnomalyConfig } from "./bi-agent/anomaly-config";
import { useDashboard } from "@/contexts/dashboard-context";

export function FloatingBIAgent() {
  const { customerBehaviorData, anomalyData, loading, currentPage } =
    useDashboard();

  // Don't show on home page
  if (currentPage === "/") {
    return null;
  }

  // Determine configuration based on current page
  const getAgentConfig = () => {
    switch (currentPage) {
      case "/customer-behavior":
        if (customerBehaviorData) {
          return {
            agentName: "Customer Behavior Intelligence Agent",
            status: {
              text:
                customerBehaviorData.kpis.churnRiskPct > 20
                  ? "Action Required"
                  : "Monitoring",
              variant:
                customerBehaviorData.kpis.churnRiskPct > 20
                  ? ("destructive" as const)
                  : ("default" as const),
            },
            tabs: createCustomerBehaviorConfig(customerBehaviorData),
            defaultTab: "risk",
          };
        } else if (loading) {
          return {
            agentName: "Customer Behavior Intelligence Agent",
            status: {
              text: "Loading...",
              variant: "secondary" as const,
            },
            tabs: createCustomerBehaviorConfig(null), // Pass null for loading state
            defaultTab: "risk",
            isLoading: true,
          };
        }
        break;
      case "/anomaly":
        if (anomalyData) {
          return {
            agentName: "Anomaly Detection Intelligence Agent",
            status: {
              text:
                anomalyData.kpis.highSeverityCount > 0
                  ? "Action Required"
                  : "Monitoring",
              variant:
                anomalyData.kpis.highSeverityCount > 0
                  ? ("destructive" as const)
                  : ("default" as const),
            },
            tabs: createAnomalyConfig(
              anomalyData,
              anomalyData?.regionDistribution || [],
              anomalyData?.categoryDistribution || [],
              anomalyData?.segmentSummary || [],
              anomalyData?.timeSeriesData || [],
              anomalyData?.riskAlerts || [],
              anomalyData?.forecasts || { overview: [], perCustomer: [] }
            ),
            defaultTab: "risk",
          };
        } else if (loading) {
          return {
            agentName: "Anomaly Detection Intelligence Agent",
            status: {
              text: "Loading...",
              variant: "secondary" as const,
            },
            tabs: createAnomalyConfig(null), // Pass null for loading state
            defaultTab: "risk",
            isLoading: true,
          };
        }
        break;
      default:
        return {
          agentName: "Business Intelligence Agent",
          status: {
            text: "Ready",
            variant: "default" as const,
          },
          tabs: createAnomalyConfig(null), // Default fallback
          defaultTab: "risk",
        };
    }
    return null;
  };

  const config = getAgentConfig();
  if (!config) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <BIAgentPopup
        {...config}
        triggerClassName="shadow-md bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0"
      />
    </div>
  );
}
