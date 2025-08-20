# Component Interaction System

This system provides a unified way to add click-to-popup insights and multi-selection context capture across dashboard components.

## Features

### 1. Click-to-Popup Insights

- Click any enhanced dashboard component to see contextual insights
- Popup shows key insights, trends, and recommendations
- Auto-dismisses after 5 seconds or manual close

### 2. Multi-Selection with Context Capture

- Hold **Shift** to activate multi-select mode
- Click multiple components while holding Shift
- Selected components are collected as context
- Send all selected contexts to AI chat for comprehensive analysis

### 3. AI Chat Integration

- Multi-selected components automatically format context for AI
- Opens chat with visual indicators of selected components
- Context is handled in the background (not shown in input field)
- AI can provide insights about relationships between selected components

## Implementation

### For New Components

1. **Import the hook:**

```tsx
import { useComponentInsights } from "@/hooks/use-component-insights";
```

2. **Create insights configuration:**

```tsx
const componentInsights = useComponentInsights({
  componentType: "Chart", // Descriptive type
  componentId: "unique-component-id", // Unique identifier
  data: {
    /* your component data */
  },
  generateInsights: (data) => {
    // Return array of insight strings
    return ["Insight 1", "Insight 2"];
  },
  metadata: {
    title: "Component Title",
    description: "Component description",
    value: "Key value",
    trend: "up" | "down" | "stable", // optional
  },
});
```

3. **Apply to your component:**

```tsx
<Card
  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
  {...componentInsights.getClickProps()}
>
  {/* Your component content */}
</Card>
```

### Insight Generators

The system includes pre-built insight generators for common component types:

- `insightGenerators.kpiTile()` - For KPI tiles
- `insightGenerators.chart()` - For charts and graphs
- `insightGenerators.table()` - For data tables
- `insightGenerators.filter()` - For filter components

### Architecture

- **ComponentInteractionProvider** - Context provider managing state
- **ComponentInsightsPopup** - Popup component showing insights
- **MultiSelectIndicator** - Visual indicator for multi-select mode
- **useComponentInsights** - Hook for easy integration

### Enhanced Components

Currently enhanced components:

- Customer Behavior KPI Tiles
- Category Treemap Chart
- Channel Donut Chart
- Anomaly Detection KPI Tiles
- Anomaly Table (including individual rows)

## Usage Instructions

### For Users

1. **View Component Insights:**

   - Click any dashboard component with hover effect
   - Read the contextual insights in the popup
   - Popup auto-closes after 5 seconds

2. **Multi-Component Analysis:**

   - Hold `Shift` to activate multi-select mode
   - Click multiple components while holding Shift to select them
   - Use "Send to AI" button in the multi-select indicator
   - Chat opens with visual indicators of selected components
   - Context is handled in background for AI analysis

3. **Visual Indicators:**
   - Components with insights have hover effects
   - Multi-select mode shows indicator at top of screen
   - Selected component count displayed
   - Clear instructions provided

### Cross-Dashboard Consistency

The system works identically across:

- Customer Behavior Dashboard (`/customer-behavior`)
- Anomaly Detection Dashboard (`/anomaly`)
- Any future dashboards using the same components

All interaction patterns, visual cues, and AI integration work consistently across all dashboard pages.
