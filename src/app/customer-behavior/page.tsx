"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  ShoppingCart,
  Target,
  Brain,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import { BehaviorKpiTiles } from "@/components/customer-behavior/behavior-kpi-tiles";
import { PatternRadarChart } from "@/components/customer-behavior/pattern-radar-chart";
import { CategoryTreemap } from "@/components/customer-behavior/category-treemap";
import { ChannelDonutChart } from "@/components/customer-behavior/channel-donut-chart";
import { EngagementMatrix } from "@/components/customer-behavior/engagement-matrix";
import { BehaviorFilters } from "@/components/customer-behavior/behavior-filters";
import { PatternIntervalHistogram } from "@/components/customer-behavior/pattern-interval-histogram";
import { ChannelJourneySankey } from "@/components/customer-behavior/channel-journey-sankey";

import { getCustomerBehaviorData } from "@/lib/customer-behavior-data";
import { CustomerBehaviorData } from "@/types/customer-behavior";
import { useDashboard } from "@/contexts/dashboard-context";

export default function CustomerBehaviorPage() {
  const { setCustomerBehaviorData, setLoading: setContextLoading } =
    useDashboard();
  const [data, setData] = useState<CustomerBehaviorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("quarterly");
  const [selectedSegment, setSelectedSegment] = useState<string | undefined>();
  const [selectedCustomer, setSelectedCustomer] = useState<
    string | undefined
  >();
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<
    { start: string; end: string } | undefined
  >();
  const [highlightCategory, setHighlightCategory] = useState<
    string | undefined
  >();
  const [highlightChannel, setHighlightChannel] = useState<
    string | undefined
  >();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setContextLoading(true);
      try {
        // Determine the effective time range
        let effectiveTimeRange = timeRange;
        if (timeRange === "custom" && dateRange) {
          effectiveTimeRange = `${dateRange.start}:${dateRange.end}`;
        }

        const behaviorData = await getCustomerBehaviorData(
          effectiveTimeRange,
          selectedSegment,
          selectedProduct,
          selectedCustomer
        );
        setData(behaviorData);
        setCustomerBehaviorData(behaviorData); // Share data with context
      } catch (error) {
        console.error("Failed to fetch customer behavior data:", error);
      } finally {
        setLoading(false);
        setContextLoading(false);
      }
    };

    fetchData();
  }, [
    timeRange,
    selectedSegment,
    selectedProduct,
    selectedCustomer,
    dateRange,
  ]);

  const handleReset = () => {
    setSelectedSegment(undefined);
    setSelectedCustomer(undefined);
    setSelectedProduct(undefined);
    setDateRange(undefined);
    setHighlightCategory(undefined);
    setHighlightChannel(undefined);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading customer behavior data...
          </p>
        </div>
      </div>
    );
  }

  const insights = [
    {
      title: "Purchase Frequency Trend",
      description:
        data.kpis.avgPurchaseInterval < 30
          ? "Customers are purchasing more frequently than average"
          : "Purchase intervals are longer than optimal",
      impact: data.kpis.avgPurchaseInterval < 30 ? "positive" : "negative",
    },
    {
      title: "Channel Preference",
      description: `${
        data.kpis.dominantChannel
      } is the primary channel with ${data.kpis.dominantChannelPct.toFixed(
        1
      )}% usage`,
      impact: "neutral",
    },
    {
      title: "Churn Risk Assessment",
      description:
        data.kpis.churnRiskPct > 20
          ? "Higher than expected churn risk detected"
          : "Churn risk is within acceptable range",
      impact: data.kpis.churnRiskPct > 20 ? "negative" : "positive",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">
                  Customer Behavior Analytics
                </h1>
                <p className="text-muted-foreground">
                  Deep insights into customer purchase patterns and preferences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                {data.patterns.length} Customers
              </Badge>
              <Badge variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}{" "}
                Analysis
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Filters */}
        <div className="mb-8">
          <BehaviorFilters
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            selectedSegment={selectedSegment}
            onSegmentChange={setSelectedSegment}
            selectedCustomer={selectedCustomer}
            onCustomerChange={setSelectedCustomer}
            selectedProduct={selectedProduct}
            onProductChange={setSelectedProduct}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onReset={handleReset}
          />
        </div>

        {/* KPI Overview */}
        <div className="mb-8">
          <BehaviorKpiTiles kpis={data.kpis} />
        </div>

        {/* Key Insights */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Key Behavioral Insights
              </CardTitle>
              <CardDescription>
                AI-generated insights based on current data patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-muted/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <Badge
                        variant={
                          insight.impact === "positive"
                            ? "default"
                            : insight.impact === "negative"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {insight.impact === "positive"
                          ? "Good"
                          : insight.impact === "negative"
                          ? "Attention"
                          : "Info"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="patterns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patterns" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Purchase Patterns
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Product Preferences
            </TabsTrigger>
            <TabsTrigger value="channels" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Channel Behavior
            </TabsTrigger>
            <TabsTrigger value="engagement" className="gap-2">
              <Target className="h-4 w-4" />
              Engagement Analysis
            </TabsTrigger>
          </TabsList>

          {/* Purchase Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PatternRadarChart
                patterns={data.patterns}
                selectedCustomer={selectedCustomer}
              />
              <PatternIntervalHistogram
                patterns={data.patterns}
                metric="recency"
                title="Purchase Recency Distribution"
                description="Days since last purchase across customer base"
              />
            </div>

            {/* Additional Pattern Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PatternIntervalHistogram
                patterns={data.patterns}
                metric="frequency"
                title="Purchase Frequency Distribution"
                description="Purchase frequency per month across customers"
              />
              <PatternIntervalHistogram
                patterns={data.patterns}
                metric="avg_order_value"
                title="Order Value Distribution"
                description="Average order value distribution across customers"
              />
            </div>
          </TabsContent>

          {/* Product Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryTreemap
                categories={data.categoryAffinities}
                highlightCategory={highlightCategory}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>
                    Top performing product categories by spend and volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.categoryAffinities
                      .slice(0, 6)
                      .map((category, index) => (
                        <div
                          key={category.category}
                          className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() =>
                            setHighlightCategory(category.category)
                          }
                        >
                          <div>
                            <div className="font-medium">
                              {category.category}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {category.count} transactions
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              ${(category.spend / 1000).toFixed(0)}k
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {category.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Channel Behavior Tab */}
          <TabsContent value="channels" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChannelDonutChart
                channels={data.channelUsage}
                highlightChannel={highlightChannel}
              />
              <ChannelJourneySankey channels={data.channelUsage} />
            </div>
          </TabsContent>

          {/* Engagement Analysis Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <EngagementMatrix engagementData={data.engagementData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Behavioral Recommendations</CardTitle>
                  <CardDescription>
                    AI-powered suggestions for customer engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Increase Purchase Frequency
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Target customers with 30+ day intervals with
                        personalized offers
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Create Campaign
                      </Button>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Reduce Churn Risk
                      </h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Engage at-risk customers with retention programs
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        View At-Risk
                      </Button>
                    </div>

                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Cross-Channel Optimization
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Promote underutilized channels to diversify touchpoints
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Optimize Channels
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Segment Performance</CardTitle>
                  <CardDescription>
                    Behavioral metrics by customer segment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        segment: "High Value",
                        score: 92,
                        trend: "up",
                        color: "text-green-600",
                      },
                      {
                        segment: "Frequent Buyers",
                        score: 87,
                        trend: "up",
                        color: "text-blue-600",
                      },
                      {
                        segment: "Seasonal",
                        score: 74,
                        trend: "stable",
                        color: "text-yellow-600",
                      },
                      {
                        segment: "New Customers",
                        score: 68,
                        trend: "up",
                        color: "text-purple-600",
                      },
                      {
                        segment: "At Risk",
                        score: 45,
                        trend: "down",
                        color: "text-red-600",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-8 rounded-full ${item.color.replace(
                              "text-",
                              "bg-"
                            )}`}
                          />
                          <div>
                            <div className="font-medium">{item.segment}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.trend === "up"
                                ? "↗"
                                : item.trend === "down"
                                ? "↘"
                                : "→"}{" "}
                              {item.trend.charAt(0).toUpperCase() +
                                item.trend.slice(1)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{item.score}</div>
                          <div className="text-sm text-muted-foreground">
                            Score
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
