"use client";

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
import { Calendar, Filter, RefreshCw, X } from "lucide-react";

interface BehaviorFiltersProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  selectedSegment?: string;
  onSegmentChange: (value: string | undefined) => void;
  selectedCustomer?: string;
  onCustomerChange: (value: string | undefined) => void;
  onReset: () => void;
}

export function BehaviorFilters({
  timeRange,
  onTimeRangeChange,
  selectedSegment,
  onSegmentChange,
  selectedCustomer,
  onCustomerChange,
  onReset,
}: BehaviorFiltersProps) {
  const timeRangeOptions = [
    { value: "monthly", label: "Last Month" },
    { value: "quarterly", label: "Last Quarter" },
    { value: "annual", label: "Last Year" },
    { value: "ytd", label: "Year to Date" },
  ];

  const segmentOptions = [
    { value: "high_value", label: "High Value Customers" },
    { value: "frequent_buyers", label: "Frequent Buyers" },
    { value: "seasonal", label: "Seasonal Customers" },
    { value: "new_customers", label: "New Customers" },
    { value: "at_risk", label: "At Risk Customers" },
  ];

  const customerOptions = [
    { value: "CUST_001", label: "Sarah Johnson" },
    { value: "CUST_002", label: "Michael Chen" },
    { value: "CUST_003", label: "Emma Rodriguez" },
    { value: "CUST_004", label: "David Wilson" },
    { value: "CUST_005", label: "Lisa Anderson" },
  ];

  const hasActiveFilters = selectedSegment || selectedCustomer;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="text-sm font-medium">Compare Customer</label>
            <Select
              value={selectedCustomer || ""}
              onValueChange={(value) => onCustomerChange(value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
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

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
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
              {selectedCustomer && (
                <Badge variant="secondary" className="gap-1">
                  {
                    customerOptions.find((c) => c.value === selectedCustomer)
                      ?.label
                  }
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
