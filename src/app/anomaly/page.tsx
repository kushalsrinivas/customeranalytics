import { Suspense } from "react";
import {
  getAnomalyDashboardData,
  getRegionDistribution,
  getCategoryDistribution,
  getSegmentSummary,
  getTimeSeriesDaily,
  getCustomerComparisonData,
  getCustomerFeatureImportance,
  getRiskAlerts,
  getForecasts,
  getSimulationBaselines,
} from "@/lib/anomaly-data";
import { KpiTiles } from "@/components/anomaly/kpi-tiles";
import { SeverityDistribution } from "@/components/anomaly/severity-distribution";
import { FeatureScatter } from "@/components/anomaly/feature-scatter";
import { AnomalyTable } from "@/components/anomaly/anomaly-table";
import { AnomalyHeatmap } from "@/components/anomaly-heatmap";
import { CustomerSegmentation } from "@/components/customer-segmentation";
import { TimeSeriesAnalysis } from "@/components/time-series-analysis";
import { RootCauseAnalysis } from "@/components/root-cause-analysis";
import { CustomerComparison } from "@/components/customer-comparison";
import { RiskScoring } from "@/components/risk-scoring";
import { ForecastCards } from "@/components/forecast-cards";
import { WhatIfSimulation } from "@/components/what-if-simulation";
import { FeatureImportance } from "@/components/feature-importance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AnomalyPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = searchParams;

  const severityLevels = safeJson<number[]>(params["severityLevels"]) ?? [
    1, 2, 3, 4, 5,
  ];
  const regions = safeJson<string[]>(params["regions"]) ?? [];
  const dateRange = safeJson<{ start: string | null; end: string | null }>(
    params["dateRange"]
  ) ?? {
    start: null,
    end: null,
  };

  const data = await getAnomalyDashboardData({
    severityLevels,
    regions,
    dateRange,
  });

  // Fetch additional data for full dashboard
  const [regionDist, categoryDist, segmentSummary, tsData, alerts, forecasts] =
    await Promise.all([
      getRegionDistribution({ severityLevels, regions, dateRange }),
      getCategoryDistribution({ severityLevels, regions, dateRange }),
      getSegmentSummary({ severityLevels, regions, dateRange }),
      getTimeSeriesDaily(30),
      getRiskAlerts(10),
      getForecasts(),
    ]);

  // Prepare per-customer deep-dive defaults using the top anomaly
  const defaultCustomer = data.anomalies[0] ?? null;
  const [featureImportance, comparisonItems, simulation] = defaultCustomer
    ? await Promise.all([
        getCustomerFeatureImportance(defaultCustomer.customerId),
        getCustomerComparisonData(defaultCustomer.customerId),
        getSimulationBaselines(defaultCustomer.customerId),
      ])
    : [[], [], { baseline: [], current: null }];

  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Anomaly Detection</h1>
        <p className="text-muted-foreground">
          Advanced Customer Behavior Analysis
        </p>
      </div>

      <Suspense>
        <KpiTiles kpis={data.kpis} />
      </Suspense>

      {/* Overview widgets from home page */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerSegmentation segments={segmentSummary} />
        <TimeSeriesAnalysis timeRange={30} data={tsData} />
      </div>

      <AnomalyHeatmap regions={regionDist} categories={categoryDist} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense>
          <SeverityDistribution data={data.severityDistribution} />
        </Suspense>
        <Suspense>
          <FeatureScatter
            anomalies={data.anomalies}
            featureContributions={data.featureContributions}
          />
        </Suspense>
      </div>

      <Suspense>
        <AnomalyTable anomalies={data.anomalies} maxRows={15} />
      </Suspense>

      {defaultCustomer && simulation.current && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RootCauseAnalysis features={featureImportance} />
            <CustomerComparison items={comparisonItems} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Importance</CardTitle>
                <CardDescription>
                  Top contributors for {defaultCustomer.customerName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureImportance features={featureImportance} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {defaultCustomer && simulation.current && (
        <WhatIfSimulation
          customer={simulation.current}
          baseline={simulation.baseline}
          currentScore={defaultCustomer.anomalyScore}
        />
      )}

      <RiskScoring alerts={alerts} />

      <ForecastCards
        overview={forecasts.overview}
        forecasts={forecasts.perCustomer}
        riskFactors={data.featureContributions.slice(0, 4).map((f) => ({
          factor: f.featureName,
          weight: f.importance / 100,
          impact:
            f.importance >= 30 ? "High" : f.importance >= 15 ? "Medium" : "Low",
        }))}
      />
    </div>
  );
}

function safeJson<T>(val: string | string[] | undefined): T | null {
  if (!val) return null;
  try {
    const s = Array.isArray(val) ? val[0] : val;
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}
