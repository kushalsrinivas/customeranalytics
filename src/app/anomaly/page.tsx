import { Suspense } from "react";
import type { ReactNode } from "react";
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
export const runtime = "nodejs";

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

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

  // Derive concise narrative insights
  const topSegment = segmentSummary[0]?.name ?? null;
  const topRegion =
    regionDist.slice().sort((a, b) => b.rate - a.rate)[0]?.name ?? null;
  const topCategory =
    categoryDist.slice().sort((a, b) => b.rate - a.rate)[0]?.name ?? null;
  const topDriver = data.kpis.topAnomalousFeature;

  // Trend: compare last 7 vs prior 7 by anomalyScore from the daily series
  const last7 = tsData.slice(-7);
  const prev7 = tsData.slice(-14, -7);
  const avg = (arr: typeof tsData) =>
    arr.length ? arr.reduce((s, v) => s + v.anomalyScore, 0) / arr.length : 0;
  const lastAvg = avg(last7);
  const prevAvg = avg(prev7);
  const trendDelta = lastAvg - prevAvg;
  const trendLabel =
    trendDelta > 0.02
      ? "increasing"
      : trendDelta < -0.02
      ? "decreasing"
      : "stable";

  return (
    <div className="anomaly-page dark relative min-h-screen overflow-hidden bg-[oklch(0.145_0_0)]">
      {/* Ambient background layers */}
      <div className="ambient" />
      <div className="noise" />

      {/* Frosted sticky header */}
      <div className="anomaly-header sticky top-0 z-40">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-whitetracking-tight">
                Anomaly Detection
              </h1>
              <p className="text-sm text-white">
                Advanced customer behavior analysis with a guided narrative for
                decision-making
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page content with glass-scoped enhancements */}
      <div
        className={`
        container mx-auto px-6 py-8
        [&_[data-slot=card]]:transition-all
        [&_[data-slot=card]]:border-white/10
        [&_[data-slot=card]]:bg-white/5
        [&_[data-slot=card]]:backdrop-blur-xl
        [&_[data-slot=card]]:shadow-[0_10px_30px_rgba(0,0,0,0.3)]
        [&_[data-slot=tabs-list]]:bg-white/5
        [&_[data-slot=tabs-list]]:border
        [&_[data-slot=tabs-list]]:border-white/10
        [&_[data-slot=tabs-list]]:backdrop-blur-xl
        [&_[data-slot=progress]]:bg-white/10
        `}
      >
        {/* Layout: sticky narrative nav + main story */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          {/* Narrative navigator */}
          <aside className="hidden lg:block">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Story Navigator</CardTitle>
                <CardDescription>Jump to section</CardDescription>
              </CardHeader>
              <CardContent>
                <nav className="text-sm space-y-2">
                  <a className="block hover:underline" href="#overview">
                    Overview
                  </a>
                  <a className="block hover:underline" href="#trends">
                    Trends
                  </a>
                  <a className="block hover:underline" href="#distribution">
                    Distribution
                  </a>
                  <a className="block hover:underline" href="#drivers">
                    Key Drivers
                  </a>
                  <a className="block hover:underline" href="#impacted">
                    Who is Impacted
                  </a>
                  {defaultCustomer && (
                    <a className="block hover:underline" href="#deep-dive">
                      Deep Dive
                    </a>
                  )}
                  {defaultCustomer && (
                    <a className="block hover:underline" href="#what-if">
                      What-If
                    </a>
                  )}
                  <a className="block hover:underline" href="#actions">
                    Actions
                  </a>
                  <a className="block hover:underline" href="#forecast">
                    Forecast
                  </a>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main narrative */}
          <main className="space-y-10">
            <Section
              id="overview"
              title="What stands out right now?"
              description={
                <span>
                  Anomaly rate is{" "}
                  <strong>{data.kpis.anomalyRate.toFixed(1)}%</strong> with{" "}
                  <strong>{data.kpis.highSeverityCount}</strong> high-severity
                  cases. Top driver: <strong>{topDriver}</strong>.
                </span>
              }
            >
              <Suspense>
                <KpiTiles kpis={data.kpis} />
              </Suspense>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key insights</CardTitle>
                  <CardDescription>
                    Context to guide your next step
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>
                      Trend is <span className="font-medium">{trendLabel}</span>{" "}
                      over the last week ({(trendDelta * 100).toFixed(1)} pts vs
                      prior week).
                    </li>
                    {topSegment && (
                      <li>
                        Segment most affected:{" "}
                        <span className="font-medium">{topSegment}</span>.
                      </li>
                    )}
                    {(topRegion || topCategory) && (
                      <li>
                        Highest anomaly rates in{" "}
                        {topRegion ? (
                          <span className="font-medium">{topRegion}</span>
                        ) : null}
                        {topRegion && topCategory ? " and " : null}
                        {topCategory ? (
                          <span className="font-medium">{topCategory}</span>
                        ) : null}
                        .
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </Section>

            <Section
              id="trends"
              title="How are anomalies evolving?"
              description="Trajectory of aggregate anomaly signal and activity over the last 30 days"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimeSeriesAnalysis timeRange={30} data={tsData} />
                <CustomerSegmentation segments={segmentSummary} />
              </div>
            </Section>

            <Section
              id="distribution"
              title="Where are anomalies concentrated?"
              description="Geographic and product category concentration"
            >
              <AnomalyHeatmap regions={regionDist} categories={categoryDist} />
            </Section>

            <Section
              id="drivers"
              title="What is driving anomalies?"
              description="Severity profile and feature contributions"
            >
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
            </Section>

            <Section
              id="impacted"
              title="Who is impacted?"
              description="Top anomalous customers ranked by score and severity"
            >
              <Suspense>
                <AnomalyTable anomalies={data.anomalies} maxRows={15} />
              </Suspense>
            </Section>

            {defaultCustomer && simulation.current && (
              <Section
                id="deep-dive"
                title={`Deep dive: ${defaultCustomer.customerName}`}
                description="Root causes, peer comparison and feature-level drivers"
              >
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
              </Section>
            )}

            {defaultCustomer && simulation.current && (
              <Section
                id="what-if"
                title="What-if simulation"
                description="Adjust key features to see the projected impact on anomaly score"
              >
                <WhatIfSimulation
                  customer={simulation.current}
                  baseline={simulation.baseline}
                  currentScore={defaultCustomer.anomalyScore}
                />
              </Section>
            )}

            <Section
              id="actions"
              title="What should we do now?"
              description="Prioritized alerts and recommended playbooks"
            >
              <RiskScoring alerts={alerts} />
            </Section>

            <Section
              id="forecast"
              title="What is likely next?"
              description="Near-term forecasts and risk outlook"
            >
              <ForecastCards
                overview={forecasts.overview}
                forecasts={forecasts.perCustomer}
                riskFactors={data.featureContributions.slice(0, 4).map((f) => ({
                  factor: f.featureName,
                  weight: f.importance / 100,
                  impact:
                    f.importance >= 30
                      ? "High"
                      : f.importance >= 15
                      ? "Medium"
                      : "Low",
                }))}
              />
            </Section>
          </main>
        </div>
      </div>

      {/* Page-scoped styling moved to globals.css under the `.anomaly-page` scope */}
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
