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
import { Calendar, Filter, RefreshCw, X, Package } from "lucide-react";

interface BehaviorFiltersProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  selectedSegment?: string;
  onSegmentChange: (value: string | undefined) => void;
  selectedCustomer?: string;
  onCustomerChange: (value: string | undefined) => void;
  selectedProduct?: string;
  onProductChange: (value: string | undefined) => void;
  dateRange?: { start: string; end: string };
  onDateRangeChange: (
    range: { start: string; end: string } | undefined
  ) => void;
  onReset: () => void;
}

interface CustomerOption {
  value: string;
  label: string;
}

interface ProductOption {
  value: string;
  label: string;
}

export function BehaviorFilters({
  timeRange,
  onTimeRangeChange,
  selectedSegment,
  onSegmentChange,
  selectedCustomer,
  onCustomerChange,
  selectedProduct,
  onProductChange,
  dateRange,
  onDateRangeChange,
  onReset,
}: BehaviorFiltersProps) {
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);

  const timeRangeOptions = [
    { value: "monthly", label: "Last Month" },
    { value: "quarterly", label: "Last Quarter" },
    { value: "annual", label: "Last Year" },
    { value: "ytd", label: "Year to Date" },
    { value: "custom", label: "Custom Date Range" },
  ];

  const segmentOptions = [
    { value: "1", label: "Segment 1" },
    { value: "2", label: "Segment 2" },
    { value: "3", label: "Segment 3" },
    { value: "4", label: "Segment 4" },
    { value: "5", label: "Segment 5" },
    { value: "6", label: "Segment 6" },
  ];

  // Load real data from API
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true);
      try {
        // Load top customers
        const response = await fetch("/api/filter-options");
        if (response.ok) {
          const data = await response.json();
          setCustomerOptions(data.customers || []);
          setProductOptions(data.products || []);
        }
      } catch (error) {
        console.error("Error loading filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const hasActiveFilters =
    selectedSegment || selectedCustomer || selectedProduct || dateRange;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Analysis Filters
        </CardTitle>
        <CardDescription>
          Customize the behavior analysis scope and focus
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Time Period
            </label>
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Segment</label>
            <Select
              value={selectedSegment || ""}
              onValueChange={(value) => onSegmentChange(value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All segments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All segments</SelectItem>
                {segmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product Category
            </label>
            <Select
              value={selectedProduct || ""}
              onValueChange={(value) => onProductChange?.(value || undefined)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loading ? "Loading..." : "All products"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                {productOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Compare Customer</label>
            <Select
              value={selectedCustomer || ""}
              onValueChange={(value) => onCustomerChange(value || undefined)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loading ? "Loading..." : "Select customer"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_comparison">No comparison</SelectItem>
                {customerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Date Range Input */}
        {timeRange === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={dateRange?.start || ""}
                onChange={(e) => {
                  const start = e.target.value;
                  if (start && dateRange?.end) {
                    onDateRangeChange({ start, end: dateRange.end });
                  } else if (start) {
                    onDateRangeChange({ start, end: start });
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
                    onDateRangeChange({ start: dateRange.start, end });
                  } else if (end) {
                    onDateRangeChange({ start: end, end });
                  }
                }}
              />
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {selectedSegment && (
                <Badge variant="secondary" className="gap-1">
                  {
                    segmentOptions.find((s) => s.value === selectedSegment)
                      ?.label
                  }
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => onSegmentChange(undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedProduct && (
                <Badge variant="secondary" className="gap-1">
                  {productOptions.find((p) => p.value === selectedProduct)
                    ?.label || `Product ${selectedProduct}`}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => onProductChange?.(undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedCustomer && (
                <Badge variant="secondary" className="gap-1">
                  {customerOptions.find((c) => c.value === selectedCustomer)
                    ?.label || `Customer ${selectedCustomer}`}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => onCustomerChange(undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {dateRange && (
                <Badge variant="secondary" className="gap-1">
                  {dateRange.start} to {dateRange.end}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => onDateRangeChange(undefined)}
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
