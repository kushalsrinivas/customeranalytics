"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CustomerBehaviorData } from "@/types/customer-behavior";
import { usePathname } from "next/navigation";
import { ComponentInteractionProvider } from "./component-interaction-context";

// Extended anomaly data structure that includes additional dashboard data
interface ExtendedAnomalyData {
  anomalies: unknown[];
  severityDistribution: unknown[];
  featureContributions: unknown[];
  kpis: {
    anomalyRate: number;
    anomalyRateTrend: number;
    highSeverityCount: number;
    topAnomalousFeature: string;
    meanAnomalyScore: number;
    meanAnomalyScoreTrend: number;
    newAnomalies24h: number;
  };
  regionDistribution?: unknown[];
  categoryDistribution?: unknown[];
  segmentSummary?: unknown[];
  timeSeriesData?: unknown[];
  riskAlerts?: unknown[];
  forecasts?: { overview: unknown[]; perCustomer: unknown[] };
}

interface DashboardContextType {
  customerBehaviorData: CustomerBehaviorData | null;
  setCustomerBehaviorData: (data: CustomerBehaviorData | null) => void;
  anomalyData: ExtendedAnomalyData | null;
  setAnomalyData: (data: ExtendedAnomalyData | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  currentPage: string;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [customerBehaviorData, setCustomerBehaviorData] =
    useState<CustomerBehaviorData | null>(null);
  const [anomalyData, setAnomalyData] = useState<ExtendedAnomalyData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Clear data when navigating away from respective pages
  useEffect(() => {
    if (pathname !== "/customer-behavior") {
      setCustomerBehaviorData(null);
    }
    if (pathname !== "/anomaly") {
      setAnomalyData(null);
    }
  }, [pathname]);

  return (
    <DashboardContext.Provider
      value={{
        customerBehaviorData,
        setCustomerBehaviorData,
        anomalyData,
        setAnomalyData,
        loading,
        setLoading,
        currentPage: pathname,
      }}
    >
      <ComponentInteractionProvider>{children}</ComponentInteractionProvider>
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
