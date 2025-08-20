"use client";

import { useCallback } from "react";
import { useComponentInteraction, ComponentContext } from "@/contexts/component-interaction-context";

export interface UseComponentInsightsProps {
  componentType: string;
  componentId: string;
  data?: any;
  generateInsights?: (data: any) => string[];
  metadata?: {
    title?: string;
    description?: string;
    value?: string | number;
    trend?: 'up' | 'down' | 'stable';
    [key: string]: any;
  };
}

export function useComponentInsights({
  componentType,
  componentId,
  data,
  generateInsights,
  metadata = {},
}: UseComponentInsightsProps) {
  const { handleComponentClick } = useComponentInteraction();

  const handleClick = useCallback((event: React.MouseEvent, customPosition?: { x: number; y: number }) => {
    const insights = generateInsights ? generateInsights(data) : [];
    
    const componentContext: ComponentContext = {
      componentType,
      componentId,
      data,
      insights,
      metadata,
    };

    handleComponentClick(componentContext, event, customPosition);
  }, [componentType, componentId, data, generateInsights, metadata, handleComponentClick]);

  return {
    handleClick,
    // Helper function to create click props for components
    getClickProps: () => ({
      onClick: handleClick,
      style: { cursor: 'pointer' },
      className: 'hover:shadow-md transition-shadow duration-200',
    }),
  };
}

// Predefined insight generators for common component types
export const insightGenerators = {
  kpiTile: (data: { value: number; change?: number; target?: number }) => {
    const insights: string[] = [];
    
    if (data.change !== undefined) {
      if (data.change > 0) {
        insights.push(`Increased by ${Math.abs(data.change)}% from previous period`);
      } else if (data.change < 0) {
        insights.push(`Decreased by ${Math.abs(data.change)}% from previous period`);
      } else {
        insights.push('No change from previous period');
      }
    }
    
    if (data.target !== undefined) {
      const performance = ((data.value / data.target) * 100).toFixed(1);
      if (data.value >= data.target) {
        insights.push(`Exceeding target by ${(data.value - data.target).toFixed(1)} (${performance}% of target)`);
      } else {
        insights.push(`Below target by ${(data.target - data.value).toFixed(1)} (${performance}% of target)`);
      }
    }
    
    return insights;
  },

  chart: (data: { dataPoints?: any[]; trend?: string; category?: string }) => {
    const insights: string[] = [];
    
    if (data.dataPoints && data.dataPoints.length > 0) {
      insights.push(`Based on ${data.dataPoints.length} data points`);
      
      // Simple trend analysis
      if (data.dataPoints.length >= 2) {
        const first = data.dataPoints[0];
        const last = data.dataPoints[data.dataPoints.length - 1];
        const firstValue = typeof first === 'object' ? first.value || first.y || 0 : first;
        const lastValue = typeof last === 'object' ? last.value || last.y || 0 : last;
        
        if (lastValue > firstValue) {
          insights.push('Showing upward trend over time period');
        } else if (lastValue < firstValue) {
          insights.push('Showing downward trend over time period');
        } else {
          insights.push('Relatively stable over time period');
        }
      }
    }
    
    if (data.category) {
      insights.push(`Category: ${data.category}`);
    }
    
    return insights;
  },

  table: (data: { rows?: any[]; selectedRow?: any; sortColumn?: string }) => {
    const insights: string[] = [];
    
    if (data.rows) {
      insights.push(`Showing ${data.rows.length} items`);
    }
    
    if (data.selectedRow) {
      insights.push('Row selected for detailed analysis');
    }
    
    if (data.sortColumn) {
      insights.push(`Sorted by ${data.sortColumn}`);
    }
    
    return insights;
  },

  filter: (data: { activeFilters?: string[]; totalItems?: number; filteredItems?: number }) => {
    const insights: string[] = [];
    
    if (data.activeFilters && data.activeFilters.length > 0) {
      insights.push(`${data.activeFilters.length} filter(s) applied: ${data.activeFilters.join(', ')}`);
    } else {
      insights.push('No filters currently applied');
    }
    
    if (data.totalItems !== undefined && data.filteredItems !== undefined) {
      const percentage = ((data.filteredItems / data.totalItems) * 100).toFixed(1);
      insights.push(`Showing ${data.filteredItems} of ${data.totalItems} items (${percentage}%)`);
    }
    
    return insights;
  },
};
