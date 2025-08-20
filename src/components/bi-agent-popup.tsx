"use client";

import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, AlertCircle, X } from "lucide-react";
import { MetricCard, MetricCardData } from "./bi-agent/metric-card";
import { InsightsSection, InsightData } from "./bi-agent/insights-section";

export interface TabConfig {
  id: string;
  label: string;
  content: TabContentData;
}

export interface TabContentData {
  metrics: MetricCardData[];
  insights?: InsightData[];
  customContent?: React.ReactNode;
}

export interface BIAgentPopupProps {
  agentName?: string;
  status?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  tabs: TabConfig[];
  defaultTab?: string;
  triggerClassName?: string;
  isLoading?: boolean;
  error?: string;
}

export function BIAgentPopup({
  agentName = "Business Intelligence Agent",
  status,
  tabs,
  defaultTab,
  triggerClassName = "",
  isLoading = false,
  error,
}: BIAgentPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");

  // Dynamically calculate grid columns based on tab count
  const tabsGridClass = useMemo(() => {
    const tabCount = tabs.length;
    if (tabCount <= 2) return "grid-cols-2";
    if (tabCount === 3) return "grid-cols-3";
    if (tabCount === 4) return "grid-cols-4";
    return "grid-cols-3"; // fallback for more than 4 tabs
  }, [tabs.length]);

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle empty tabs gracefully
  if (tabs.length === 0 && !isLoading) {
    return null;
  }

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="lg"
        className={`gap-2 transition-all duration-200 ${triggerClassName}`}
        aria-label="Open Business Intelligence Agent"
        disabled={isLoading}
        onClick={() => setIsOpen(true)}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Brain className="h-4 w-4" />
        )}
        BI Agent
        {error && <AlertCircle className="h-3 w-3 text-destructive ml-1" />}
      </Button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[420px] h-[600px] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 mt-4 mr-4">
            {/* Header */}
            <div className="border-b pb-4 flex-shrink-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-t-2xl px-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0 shadow-sm">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : error ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <Brain className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-bold truncate text-slate-900 dark:text-slate-100">
                      {agentName}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      {error
                        ? "Error loading insights"
                        : isLoading
                        ? "Loading AI insights..."
                        : "AI-powered insights and recommendations"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {status && (
                    <Badge
                      variant={status.variant || "default"}
                      className="text-xs px-2 py-0.5 font-medium"
                    >
                      {status.text}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {/* Error State */}
              {error && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="p-3 rounded-full bg-destructive/10 w-fit mx-auto">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        Unable to Load Data
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        {error}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="mt-4"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && !error && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        Loading Insights
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Analyzing your data to generate insights...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              {!isLoading && !error && tabs.length > 0 && (
                <div className="py-4 px-3 space-y-4 h-full overflow-auto bg-slate-50/50 dark:bg-slate-900/50">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="h-full flex flex-col"
                  >
                    <TabsList
                      className={`grid w-full ${tabsGridClass} flex-shrink-0 h-9 bg-white dark:bg-slate-800 shadow-sm border`}
                    >
                      {tabs.map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="text-xs font-medium px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <span className="truncate">{tab.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <div className="flex-1 overflow-auto px-1 pt-3">
                      {tabs.map((tab) => (
                        <TabsContent
                          key={tab.id}
                          value={tab.id}
                          className="mt-0 space-y-4 h-full data-[state=active]:flex data-[state=active]:flex-col"
                        >
                          {/* Empty State */}
                          {tab.content.metrics.length === 0 &&
                            !tab.content.insights?.length &&
                            !tab.content.customContent && (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center space-y-4">
                                  <div className="p-3 rounded-full bg-muted/50 w-fit mx-auto">
                                    <Brain className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                  <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">
                                      No Data Available
                                    </h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                      There&apos;s no data to display for this
                                      section yet.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Metrics Section */}
                          {tab.content.metrics.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                  Key Metrics
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0.5"
                                >
                                  {tab.content.metrics.length}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {tab.content.metrics.map((metric, index) => (
                                  <MetricCard key={index} {...metric} />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Insights Section */}
                          {tab.content.insights &&
                            tab.content.insights.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    Insights & Recommendations
                                  </h3>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0.5"
                                  >
                                    {tab.content.insights.length}
                                  </Badge>
                                </div>
                                <InsightsSection
                                  insights={tab.content.insights}
                                />
                              </div>
                            )}

                          {/* Custom Content */}
                          {tab.content.customContent && (
                            <div className="space-y-4 flex-1">
                              {tab.content.customContent}
                            </div>
                          )}
                        </TabsContent>
                      ))}
                    </div>
                  </Tabs>
                </div>
              )}

              {/* Empty Tabs State */}
              {!isLoading && !error && tabs.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="p-3 rounded-full bg-muted/50 w-fit mx-auto">
                      <Brain className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        No Configuration
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        No tabs have been configured for this agent.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
