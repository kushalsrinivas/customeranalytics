# Business Intelligence Agent Component

A reusable Business Intelligence Agent popup component that can be integrated across different dashboards to provide AI-powered insights and recommendations.

## Components Overview

### Main Components

- **`BIAgentSheet`** - Main popup component with configurable tabs and content
- **`MetricCard`** - Reusable metric display cards with icons, trends, and colors
- **`InsightsSection`** - Displays AI-generated insights and recommendations

### Configuration Helpers

- **`customer-behavior-config.tsx`** - Specific configuration for customer behavior dashboard
- **`anomaly-config.tsx`** - Example configuration for anomaly detection dashboard
- **`config-helpers.tsx`** - Generic helpers for creating configurations

## Usage

### Basic Implementation

```tsx
import { BIAgentSheet } from "@/components/bi-agent-sheet";
import { createCustomerBehaviorConfig } from "@/components/bi-agent/customer-behavior-config";

// In your dashboard component
<BIAgentSheet
  agentName="Customer Behavior Intelligence Agent"
  status={{
    text: "Monitoring",
    variant: "default",
  }}
  tabs={createCustomerBehaviorConfig(data)}
  defaultTab="overview"
/>;
```

### Custom Configuration

```tsx
import { BIAgentSheet, TabConfig } from "@/components/bi-agent-sheet";
import {
  MetricHelpers,
  InsightHelpers,
} from "@/components/bi-agent/config-helpers";

const customTabs: TabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    content: {
      metrics: [
        MetricHelpers.percentage("Conversion Rate", 24.5, "Current month"),
        MetricHelpers.currency(
          "Revenue",
          125000,
          "Total this quarter",
          "short"
        ),
      ],
      insights: [
        InsightHelpers.recommendation(
          "conversion-opt",
          "Optimize Conversion",
          "Conversion rate can be improved with targeted campaigns",
          "15-20% increase in conversions",
          "Create Campaign"
        ),
      ],
    },
  },
];

<BIAgentSheet agentName="Sales Intelligence Agent" tabs={customTabs} />;
```

## Component Props

### BIAgentSheet Props

| Prop               | Type          | Default                         | Description                                 |
| ------------------ | ------------- | ------------------------------- | ------------------------------------------- |
| `agentName`        | `string`      | `"Business Intelligence Agent"` | Name displayed in the header                |
| `status`           | `object`      | `undefined`                     | Optional status badge with text and variant |
| `tabs`             | `TabConfig[]` | Required                        | Array of tab configurations                 |
| `defaultTab`       | `string`      | First tab ID                    | Default active tab                          |
| `triggerClassName` | `string`      | `""`                            | Additional CSS classes for trigger button   |

### TabConfig Interface

```tsx
interface TabConfig {
  id: string;
  label: string;
  content: TabContentData;
}

interface TabContentData {
  metrics: MetricCardData[];
  insights?: InsightData[];
  customContent?: React.ReactNode;
}
```

### MetricCardData Interface

```tsx
interface MetricCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
  };
  color?: "default" | "success" | "warning" | "danger";
}
```

### InsightData Interface

```tsx
interface InsightData {
  id: string;
  title: string;
  description: string;
  type: "recommendation" | "warning" | "opportunity" | "insight";
  priority?: "low" | "medium" | "high";
  impact?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  metrics?: {
    label: string;
    value: string;
  }[];
}
```

## Helper Functions

### MetricHelpers

- `percentage(title, value, subtitle?, threshold?)` - Create percentage metric
- `currency(title, value, subtitle?, format?)` - Create currency metric
- `count(title, value, subtitle?, trend?)` - Create count metric
- `score(title, value, maxValue?, subtitle?)` - Create score metric

### InsightHelpers

- `recommendation(id, title, description, impact, actionLabel, actionCallback?, priority?)` - Create recommendation insight
- `warning(id, title, description, impact, actionLabel, actionCallback?, priority?)` - Create warning insight
- `opportunity(id, title, description, impact, actionLabel, actionCallback?, priority?)` - Create opportunity insight

## Examples

### Customer Behavior Dashboard

```tsx
// Already implemented in customer-behavior-config.tsx
const tabs = createCustomerBehaviorConfig(behaviorData);
```

### Custom Sales Dashboard

```tsx
const salesTabs = createCustomDashboardConfig([
  {
    id: "performance",
    label: "Performance",
    metrics: [
      MetricHelpers.currency("Revenue", 250000, "This quarter"),
      MetricHelpers.percentage("Growth", 12.5, "QoQ growth"),
    ],
    insights: [
      InsightHelpers.opportunity(
        "upsell",
        "Upselling Opportunity",
        "Existing customers show potential for premium upgrades",
        "25% revenue increase",
        "Create Upsell Campaign"
      ),
    ],
  },
]);
```

### Anomaly Detection Dashboard

```tsx
// Example implemented in anomaly-config.tsx
const anomalyTabs = createAnomalyDashboardConfig(anomalyData);
```

## Styling

The component uses neutral styling with CSS variables and supports both light and dark themes:

- Uses `hsl(var(--chart-1))` through `hsl(var(--chart-5))` for consistent colors
- Supports color variants: `default`, `success`, `warning`, `danger`
- Responsive design with proper mobile support
- Consistent with existing UI component patterns

## Features

### ✅ Implemented Features

- **Modular Design**: Fully reusable across different dashboards
- **Configurable Tabs**: Support for any number of tabs with custom content
- **Metric Cards**: Flexible metric display with icons, trends, and colors
- **Insights System**: AI-style recommendations with priority levels and actions
- **Status Indicators**: Optional status badges for different states
- **Responsive Layout**: Works on desktop and mobile devices
- **Theme Support**: Supports light and dark themes
- **Type Safety**: Full TypeScript support with proper interfaces

### 🔄 Extensible Features

- **Custom Content**: Each tab can include custom React components
- **Action Callbacks**: Insights can trigger custom actions
- **Dynamic Status**: Status can change based on data conditions
- **Trend Indicators**: Metrics can show directional trends
- **Priority Levels**: Insights support low/medium/high priority levels

## Integration Examples

The component is already integrated with the Customer Behavior dashboard and can be easily added to other dashboards by:

1. Creating a configuration function for your dashboard data
2. Adding the BIAgentSheet component to your page
3. Passing the configuration and any dynamic status information

This provides a consistent AI assistant experience across all analytics dashboards.
