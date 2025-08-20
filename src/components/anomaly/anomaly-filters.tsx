"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Calendar,
  Filter,
  RefreshCw,
  X,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { AnomalyFilters } from "@/types/anomaly";

/**
 * Anomaly Filters Component
 *
 * Database Field Mapping:
 * - "Market Segments" UI → filters.regions → c."Market Desc" in DB (e.g., "Clubs & Resorts")
 * - "Countries" UI → Not yet implemented → c."Customer Country" in DB (e.g., "United States")
 * - "Customer Segments" UI → Not yet implemented → c."Monetary Band" in DB (e.g., "Big", "Medium")
 * - Severity Levels: 1-5 (calculated from anomaly score * 5)
 * - Min Score: 0.0-1.0 (default 0.2 to filter out low anomalies)
 */

interface AnomalyFiltersProps {
  filters: AnomalyFilters;
  onFiltersChange: (filters: AnomalyFilters) => void;
  onReset: () => void;
}

interface RegionOption {
  value: string;
  label: string;
}

interface CountryOption {
  value: string;
  label: string;
}

interface SegmentOption {
  value: string;
  label: string;
}

export function AnomalyFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
}: AnomalyFiltersProps) {
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [segmentOptions, setSegmentOptions] = useState<SegmentOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Severity level options
  const severityOptions = [
    { value: 1, label: "Level 1 (Low)", color: "bg-blue-500" },
    { value: 2, label: "Level 2 (Low-Med)", color: "bg-cyan-500" },
    { value: 3, label: "Level 3 (Medium)", color: "bg-yellow-500" },
    { value: 4, label: "Level 4 (High)", color: "bg-orange-500" },
    { value: 5, label: "Level 5 (Critical)", color: "bg-red-500" },
  ];

  // Default severity levels if none selected
  const selectedSeverityLevels = filters.severityLevels || [1, 2, 3, 4, 5];
  const selectedRegions = filters.regions || [];
  const dateRange = filters.dateRange;

  // Load filter options from the database
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/anomaly-filter-options");
        if (response.ok) {
          const data = await response.json();
          setRegionOptions(data.regions || []);
          setCountryOptions(data.countries || []);
          setSegmentOptions(data.segments || []);
        }
      } catch (error) {
        console.error("Error loading filter options:", error);
        // Set empty arrays as fallback
        setRegionOptions([]);
        setCountryOptions([]);
        setSegmentOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleSeverityToggle = (level: number) => {
    const newLevels = selectedSeverityLevels.includes(level)
      ? selectedSeverityLevels.filter((l) => l !== level)
      : [...selectedSeverityLevels, level].sort();

    onFiltersChange({
      ...filters,
      severityLevels: newLevels.length > 0 ? newLevels : [1, 2, 3, 4, 5],
    });
  };

  const handleRegionToggle = (region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter((r) => r !== region)
      : [...selectedRegions, region];

    onFiltersChange({
      ...filters,
      regions: newRegions.length > 0 ? newRegions : undefined,
    });
  };

  const handleDateRangeChange = (
    range: { start: string; end: string } | undefined
  ) => {
    onFiltersChange({
      ...filters,
      dateRange: range ? { start: range.start, end: range.end } : undefined,
    });
  };

  const handleMinScoreChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      minScore: value[0],
    });
  };

  const hasActiveFilters =
    (filters.severityLevels && filters.severityLevels.length < 5) ||
    (filters.regions && filters.regions.length > 0) ||
    filters.dateRange ||
    (filters.minScore !== undefined && filters.minScore > 0.2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Anomaly Detection Filters
        </CardTitle>
        <CardDescription>
          Customize the anomaly detection scope and sensitivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Severity Levels */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Severity Levels
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {severityOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedSeverityLevels.includes(option.value)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => handleSeverityToggle(option.value)}
                className={`justify-start gap-2 ${
                  selectedSeverityLevels.includes(option.value)
                    ? "ring-2 ring-primary"
                    : ""
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${option.color}`} />
                <span className="text-xs">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Minimum Anomaly Score */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Minimum Anomaly Score: {(filters.minScore || 0.2).toFixed(2)}
          </label>
          <div className="px-2">
            <Slider
              value={[filters.minScore || 0.2]}
              onValueChange={handleMinScoreChange}
              max={1}
              min={0}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.00 (All)</span>
              <span>0.50 (Medium)</span>
              <span>1.00 (Critical Only)</span>
            </div>
          </div>
        </div>

        {/* Market Segments (what the code calls "regions") */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Market Segments
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {regionOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedRegions.includes(option.value) ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleRegionToggle(option.value)}
                disabled={loading}
                className="justify-start text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Countries */}
        {countryOptions.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Countries
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {countryOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="justify-start text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Country filtering will be available in a future update
            </p>
          </div>
        )}

        {/* Customer Segments */}
        {segmentOptions.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Customer Segments
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              {segmentOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="justify-start text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Customer segment filtering will be available in a future
              update
            </p>
          </div>
        )}

        {/* Date Range */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={dateRange?.start || ""}
                onChange={(e) => {
                  const start = e.target.value;
                  if (start && dateRange?.end) {
                    handleDateRangeChange({ start, end: dateRange.end });
                  } else if (start) {
                    handleDateRangeChange({ start, end: start });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={dateRange?.end || ""}
                min={dateRange?.start || ""}
                onChange={(e) => {
                  const end = e.target.value;
                  if (end && dateRange?.start) {
                    handleDateRangeChange({ start: dateRange.start, end });
                  } else if (end) {
                    handleDateRangeChange({ start: end, end });
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>

              {/* Severity filter badge */}
              {filters.severityLevels && filters.severityLevels.length < 5 && (
                <Badge variant="secondary" className="gap-1">
                  Severity: {filters.severityLevels.join(", ")}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        severityLevels: [1, 2, 3, 4, 5],
                      })
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {/* Min score filter badge */}
              {filters.minScore !== undefined && filters.minScore > 0.2 && (
                <Badge variant="secondary" className="gap-1">
                  Min Score: {filters.minScore.toFixed(2)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() =>
                      onFiltersChange({ ...filters, minScore: 0.2 })
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {/* Market segments filter badges */}
              {selectedRegions.map((region) => (
                <Badge key={region} variant="secondary" className="gap-1">
                  Market: {region}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => handleRegionToggle(region)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

              {/* Date range filter badge */}
              {dateRange && (
                <Badge variant="secondary" className="gap-1">
                  {dateRange.start} to {dateRange.end}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => handleDateRangeChange(undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
