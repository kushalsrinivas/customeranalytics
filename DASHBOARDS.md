# Customer Analytics Dashboards Documentation

This document provides comprehensive technical documentation for both dashboards in the Customer Analytics system. Each component is detailed with its purpose, functionality, data sources, user interactions, and technical dependencies.

## System Overview

The Customer Analytics platform consists of two main dashboards:

1. **Customer Behavior Analytics Dashboard** - Deep insights into customer purchase patterns and preferences
2. **Anomaly Detection Dashboard** - Advanced customer behavior analysis with guided narrative for decision-making

Both dashboards share a common AI integration system that allows users to select multiple components (using Shift+Click) and send contextual data to an AI chat agent for deeper insights.

---

# Dashboard A: Customer Behavior Analytics

**Route:** `/customer-behavior`  
**Purpose:** Analyze customer purchase patterns, product preferences, channel behavior, and engagement metrics to optimize customer experience and drive business growth.

## Components Overview

### 1. Behavior Filters Panel

**Component Name:** `BehaviorFilters`

**Purpose & Functionality:**

- Provides comprehensive filtering controls for customizing the behavior analysis scope
- Allows users to filter by time period, customer segment, product category, specific customers, and custom date ranges
- Enables focused analysis on specific customer cohorts or time periods

**Data Source & Flow:**

- **API Endpoint:** `/api/filter-options`
- **Data Source:** SQLite database (`customers.db`)
- **Data Tables:** `dbo_D_Customer`, `dbo_F_Sales_Transaction`
- **Data Type:** Real-time fetched options from database
- **Caching:** Options loaded once on component mount

**Data Representation:**

- Time period selector with predefined options (Monthly, Quarterly, Annual, YTD, Custom)
- Customer segment dropdown (Segment 1-6)
- Product category multi-select dropdown
- Customer comparison selector
- Custom date range inputs with start/end date pickers
- Active filters display with removable badges

**User Interaction:**

- Filter selection triggers automatic dashboard refresh
- Active filters shown as removable badges
- Reset button clears all active filters
- Custom date range only appears when "Custom Date Range" is selected
- All filter changes propagate to child components

**AI Integration Context:**

- Not directly integrated with AI chat
- Filter state affects all other components' AI context

**Technical Dependencies:**

- **Frontend:** React, Lucide icons, shadcn/ui components
- **Backend:** Next.js API routes, better-sqlite3
- **State Management:** Local component state with prop callbacks

**Performance Considerations:**

- Filter options cached after initial load
- Debounced filter changes to prevent excessive API calls
- Efficient SQL queries with proper indexing

**Error Handling & Edge Cases:**

- Graceful fallback when filter options API fails
- Loading states during option fetching
- Validation for custom date ranges
- Empty state handling when no options available

---

### 2. Behavior KPI Tiles

**Component Name:** `BehaviorKpiTiles`

**Purpose & Functionality:**

- Displays key performance indicators for customer behavior analysis
- Provides at-a-glance metrics including purchase intervals, order values, category diversity, channel mix, and churn risk
- Each tile shows trend indicators and contextual information

**Data Source & Flow:**

- **API Endpoint:** `/api/customer-behavior`
- **Data Source:** Calculated from transaction and customer data
- **Processing:** Real-time aggregation of customer metrics
- **Update Frequency:** On filter changes or page load

**Data Representation:**

- Five KPI cards in responsive grid layout:
  1. **Average Purchase Interval** (days) with trend indicator
  2. **Average Order Value** ($) with upward trend
  3. **Category Diversity** (numerical score) with stability indicator
  4. **Channel Mix** (dominant channel + percentage)
  5. **Churn Risk** (percentage) with risk-based color coding

**User Interaction:**

- Click on any KPI tile to view detailed insights
- Hover effects provide visual feedback
- Shift+Click adds tile to AI chat context for multi-component analysis

**AI Integration Context:**

- Passes KPI values, trends, and calculated insights
- Provides recommendations based on KPI thresholds
- Contextual analysis of performance indicators

**Technical Dependencies:**

- **Frontend:** React, Recharts, Lucide icons
- **State Management:** useComponentInsights hook
- **Styling:** Tailwind CSS with custom color schemes

**Performance Considerations:**

- Memoized calculations for trend indicators
- Efficient rendering with React.memo
- Optimized color calculations

**Error Handling & Edge Cases:**

- Fallback values when data is missing
- Graceful handling of calculation errors
- Loading states during data fetch

**Example Data & Output:**

```json
{
  "avgPurchaseInterval": 45,
  "avgOrderValue": 127.5,
  "categoryDiversity": 3.2,
  "dominantChannel": "Online",
  "dominantChannelPct": 68.5,
  "churnRiskPct": 12.3
}
```

---

### 3. Purchase Behavior Radar Chart

**Component Name:** `PatternRadarChart`

**Purpose & Functionality:**

- Visualizes multi-dimensional customer purchase patterns using radar chart
- Compares individual customer behavior against average benchmarks
- Shows six key dimensions: Frequency, Recency, Order Value, Quantity, Diversity, Loyalty

**Data Source & Flow:**

- **Data Source:** Customer behavior patterns from `/api/customer-behavior`
- **Processing:** Aggregated metrics normalized to 0-100 scale
- **Real-time Updates:** Responds to filter changes and customer selection

**Data Representation:**

- Interactive radar chart with 6 axes
- Blue filled area shows average customer behavior
- Dashed line overlay when specific customer selected
- Normalized values (0-100) for consistent visualization
- Legend showing comparison between average and selected customer

**User Interaction:**

- Automatically updates when customer filter changes
- Hover tooltips show exact values
- Click chart to open AI insights panel
- Shift+Click adds to multi-component AI analysis

**AI Integration Context:**

- Provides pattern analysis insights
- Compares individual vs. average performance
- Suggests actions based on pattern deviations
- Contextual recommendations for customer engagement

**Technical Dependencies:**

- **Frontend:** React, Recharts (RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis)
- **Data Processing:** Custom normalization functions
- **Styling:** CSS custom properties for theming

**Performance Considerations:**

- Efficient data transformation with memoization
- Optimized rendering for smooth animations
- Minimal re-renders on data updates

**Error Handling & Edge Cases:**

- Empty state when no pattern data available
- Graceful handling of missing customer data
- Fallback to average-only view when customer not selected

---

### 4. Category Preferences Treemap

**Component Name:** `CategoryTreemap`

**Purpose & Functionality:**

- Visualizes product category distribution by spend volume using treemap layout
- Shows relative importance of different product categories
- Enables category highlighting and performance analysis

**Data Source & Flow:**

- **Data Source:** Category affinity data from customer behavior API
- **Processing:** Spend-based sizing with percentage calculations
- **Update Frequency:** Real-time based on applied filters

**Data Representation:**

- Interactive treemap with rectangles sized by spend volume
- Color-coded categories with consistent color scheme
- Text overlays showing category name, spend amount, and percentage
- Legend grid showing top 8 categories with spend/percentage details
- Summary statistics (total categories, total spend, total transactions)

**User Interaction:**

- Click categories in performance list to highlight in treemap
- Hover effects show category details
- Visual highlighting when category selected from external components
- Responsive sizing based on container dimensions

**AI Integration Context:**

- Category performance analysis and insights
- Spend concentration recommendations
- Cross-selling opportunity identification
- Market diversification strategies

**Technical Dependencies:**

- **Frontend:** React, Recharts Treemap component
- **Data Validation:** Custom filtering for valid categories
- **Styling:** Dynamic color assignment and text rendering

**Performance Considerations:**

- Efficient data filtering and validation
- Optimized rendering for large category sets
- Smart text rendering based on rectangle size

**Error Handling & Edge Cases:**

- Empty state with informative message
- Handles invalid or missing category data
- Graceful fallback for rendering errors
- Responsive text sizing for small rectangles

**Example Data & Output:**

```json
{
  "category": "Electronics",
  "count": 1250,
  "spend": 45000,
  "percentage": 23.5
}
```

---

### 5. Channel Distribution Donut Chart

**Component Name:** `ChannelDonutChart`

**Purpose & Functionality:**

- Displays customer purchase behavior across different channels using donut chart
- Shows channel performance with transaction counts, spend amounts, and percentages
- Identifies dominant channels and distribution patterns

**Data Source & Flow:**

- **Data Source:** Channel usage data from customer behavior API
- **Processing:** Aggregated channel metrics with percentage calculations
- **Updates:** Real-time based on filter changes

**Data Representation:**

- Interactive donut chart with channel segments
- Percentage labels on segments (>5% threshold)
- Dominant channel highlighted in center
- Channel legend with spend and percentage details
- Color-coded segments with consistent theming

**User Interaction:**

- Hover tooltips show detailed channel metrics
- Channel highlighting from external component interactions
- Click to open detailed channel insights
- Visual feedback on hover and selection

**AI Integration Context:**

- Channel performance analysis
- Customer acquisition strategy insights
- Channel diversification recommendations
- Mobile vs. desktop usage patterns

**Technical Dependencies:**

- **Frontend:** React, Recharts (PieChart, Pie, Cell, Tooltip, Legend)
- **Data Processing:** Percentage calculations and formatting
- **Theming:** CSS custom properties for colors

**Performance Considerations:**

- Efficient data transformation
- Optimized tooltip rendering
- Smooth animations and transitions

**Error Handling & Edge Cases:**

- Handles empty channel data gracefully
- Validates percentage calculations
- Fallback colors for undefined channels

---

### 6. Channel Journey Flow Chart

**Component Name:** `ChannelJourneySankey`

**Purpose & Functionality:**

- Visualizes customer behavior outcomes across different channels using stacked bar chart
- Shows customer journey flow from channel entry to various outcomes (purchase, browse, support, exit)
- Provides conversion rate analysis and channel performance insights

**Data Source & Flow:**

- **Data Source:** Channel usage data transformed into flow patterns
- **Processing:** Simulated customer journey outcomes with realistic conversion rates
- **Flow Simulation:** Purchase (35-50%), Browse (25-40%), Support (10-20%), Exit (remainder)

**Data Representation:**

- Stacked bar chart showing channel interactions
- Four outcome categories: Purchase (green), Browse (blue), Support (yellow), Exit (red)
- Channel performance summary with conversion rates
- Total interactions and overall conversion metrics
- Top performing channels ranked by conversion rate

**User Interaction:**

- Hover tooltips show detailed outcome breakdowns
- Interactive legend for filtering outcomes
- Click to access detailed channel analysis
- Responsive design adapts to container size

**AI Integration Context:**

- Cross-channel optimization insights
- Customer journey mapping recommendations
- Conversion rate improvement strategies
- Channel-specific engagement tactics

**Technical Dependencies:**

- **Frontend:** React, Recharts (BarChart, Bar, XAxis, YAxis, CartesianGrid)
- **Data Processing:** Flow simulation algorithms
- **Icons:** Lucide React icons for UI elements

**Performance Considerations:**

- Efficient flow data generation
- Optimized rendering for multiple data series
- Cached calculations for performance metrics

**Error Handling & Edge Cases:**

- Empty state with informative placeholder
- Handles missing channel data
- Graceful degradation for calculation errors

---

### 7. Customer Engagement Matrix

**Component Name:** `EngagementMatrix`

**Purpose & Functionality:**

- Displays customer distribution by recency vs frequency using scatter plot
- Implements RFM (Recency, Frequency, Monetary) analysis for customer segmentation
- Categorizes customers into engagement levels: Champions, Loyal, Promising, At Risk

**Data Source & Flow:**

- **Data Source:** Engagement data from customer behavior API
- **Processing:** RFM-based customer segmentation
- **Segmentation Logic:** Based on recency, frequency, and spend volume

**Data Representation:**

- Scatter plot with recency (X-axis) vs frequency (Y-axis)
- Color-coded points by engagement level
- Point size represents spend volume
- Engagement statistics grid showing segment distribution
- Quadrant explanations for engagement levels

**User Interaction:**

- Hover tooltips show customer details and metrics
- Click points for individual customer analysis
- Interactive legend for segment filtering
- Responsive chart sizing

**AI Integration Context:**

- Customer segmentation insights
- Retention strategy recommendations
- Upselling and cross-selling opportunities
- Churn prevention strategies

**Technical Dependencies:**

- **Frontend:** React, Recharts (ScatterChart, Scatter, XAxis, YAxis)
- **Segmentation:** Custom RFM analysis logic
- **UI Components:** Badge components for segment display

**Performance Considerations:**

- Efficient scatter plot rendering
- Optimized tooltip performance
- Smart point sizing calculations

**Error Handling & Edge Cases:**

- Handles missing engagement data
- Validates scatter plot coordinates
- Fallback for invalid segment classifications

---

### 8. Pattern Interval Histograms

**Component Name:** `PatternIntervalHistogram`

**Purpose & Functionality:**

- Creates histogram distributions for customer behavior metrics
- Supports three metrics: recency, frequency, and average order value
- Shows distribution patterns and statistical insights

**Data Source & Flow:**

- **Data Source:** Customer behavior patterns from API
- **Processing:** Dynamic histogram binning with statistical calculations
- **Metrics:** Recency (days), Frequency (per month), Order Value ($)

**Data Representation:**

- Bar chart histogram with dynamic binning
- Reference line showing average value
- Statistical summary (total customers, average, range)
- Customizable titles and descriptions per metric
- Context-sensitive axis labels and formatting

**User Interaction:**

- Hover tooltips show bin ranges and customer counts
- Click for detailed distribution analysis
- Responsive chart sizing and bin calculations

**AI Integration Context:**

- Distribution analysis insights
- Behavioral pattern identification
- Segmentation recommendations
- Outlier detection and analysis

**Technical Dependencies:**

- **Frontend:** React, Recharts (BarChart, Bar, ReferenceLine)
- **Statistics:** Custom histogram binning algorithms
- **Data Processing:** Dynamic bin size calculation

**Performance Considerations:**

- Efficient binning algorithms
- Optimized for varying data sizes
- Smart bin count calculation based on data volume

**Error Handling & Edge Cases:**

- Empty state for missing data
- Handles invalid metric values
- Graceful fallback for calculation errors

---

## Data Flow Architecture - Customer Behavior Dashboard

### Primary Data Sources

- **Database:** SQLite (`customers.db`)
- **Tables:**
  - `dbo_D_Customer` (customer master data)
  - `dbo_F_Sales_Transaction` (transaction records)
  - `dbo_F_Customer_Loyalty` (loyalty information)

### API Endpoints

- **`/api/customer-behavior`** - Main data endpoint
- **`/api/filter-options`** - Filter dropdown options

### Data Processing Pipeline

1. **Filter Parameters** → API request with query parameters
2. **Database Query** → SQL queries with joins and aggregations
3. **Data Processing** → Calculate patterns, KPIs, and engagement metrics
4. **Response Formatting** → Structured JSON response
5. **Component Rendering** → Real-time visualization updates

---

# Dashboard B: Anomaly Detection

**Route:** `/anomaly`  
**Purpose:** Advanced customer behavior analysis with anomaly detection, featuring a guided narrative structure for decision-making and comprehensive anomaly investigation tools.

## Components Overview

### 1. Anomaly Detection Filters

**Component Name:** `AnomalyFiltersComponent`

**Purpose & Functionality:**

- Provides comprehensive filtering controls for anomaly detection analysis
- Enables severity-based filtering, market segment selection, and anomaly score thresholds
- Supports date range filtering and multiple filter combinations

**Data Source & Flow:**

- **API Endpoint:** `/api/anomaly-filter-options`
- **Data Source:** SQLite database with market segments and customer data
- **Processing:** Real-time filter option loading
- **Database Fields:** `Market Desc`, `Customer Country`, `Monetary Band`

**Data Representation:**

- Severity level toggles (Level 1-5) with color coding
- Minimum anomaly score slider (0.0-1.0)
- Market segment multi-select buttons
- Date range picker with start/end dates
- Active filter badges with removal options
- Reset all functionality

**User Interaction:**

- Toggle severity levels with visual feedback
- Adjust anomaly score threshold with real-time updates
- Select multiple market segments
- Set custom date ranges
- Remove individual filters or reset all
- All changes trigger dashboard refresh

**AI Integration Context:**

- Filter context affects all anomaly analysis
- Provides filtering strategy insights
- Recommends optimal filter combinations

**Technical Dependencies:**

- **Frontend:** React, shadcn/ui components, Slider component
- **Backend:** better-sqlite3 for filter options
- **State Management:** Local state with callback props

**Performance Considerations:**

- Filter options cached after initial load
- Debounced filter changes
- Efficient SQL queries for options

**Error Handling & Edge Cases:**

- Graceful fallback when API fails
- Loading states during option fetching
- Validation for date ranges and score thresholds

---

### 2. Anomaly KPI Tiles

**Component Name:** `KpiTiles`

**Purpose & Functionality:**

- Displays key anomaly detection metrics in tile format
- Provides overview of anomaly rates, severity distribution, and detection trends
- Each tile offers contextual insights and trend analysis

**Data Source & Flow:**

- **Data Source:** Calculated from anomaly detection algorithms
- **Processing:** Real-time KPI calculations from customer metrics
- **Update Frequency:** On filter changes and data refresh

**Data Representation:**

- Five KPI tiles:
  1. **Anomaly Rate** (percentage of total customers)
  2. **High Severity Count** (severity 4-5 anomalies)
  3. **Top Anomalous Feature** (most frequent deviation)
  4. **Mean Anomaly Score** (average across all anomalies)
  5. **New Anomalies** (last 24 hours)

**User Interaction:**

- Click tiles for detailed insights
- Hover effects with visual feedback
- Shift+Click for multi-component AI analysis
- Individual tile analysis sheets

**AI Integration Context:**

- KPI trend analysis and recommendations
- Threshold-based alerting insights
- Comparative analysis across time periods

**Technical Dependencies:**

- **Frontend:** React, Badge components for labeling
- **Data Processing:** Statistical calculations
- **UI:** Card components with consistent styling

**Performance Considerations:**

- Efficient KPI calculations
- Memoized trend computations
- Optimized rendering performance

**Error Handling & Edge Cases:**

- Fallback values for missing data
- Handles calculation errors gracefully
- Loading states during data processing

---

### 3. Severity Distribution Chart

**Component Name:** `SeverityDistribution`

**Purpose & Functionality:**

- Visualizes anomaly distribution across severity levels (1-5)
- Shows count and percentage for each severity level
- Provides interactive drill-down capabilities

**Data Source & Flow:**

- **Data Source:** Anomaly severity calculations from customer metrics
- **Processing:** Severity level aggregation with percentage calculations
- **Color Coding:** Consistent severity color scheme across dashboard

**Data Representation:**

- Horizontal bar chart with severity levels
- Color-coded bars (blue to purple gradient)
- Count and percentage labels on each bar
- Interactive bars for drill-down analysis
- Total anomaly count in header

**User Interaction:**

- Click severity levels to filter dashboard
- Hover for detailed information
- Visual feedback on interaction
- Drill-down to specific severity cases

**AI Integration Context:**

- Severity distribution analysis
- Risk level recommendations
- Prioritization strategies for anomaly investigation

**Technical Dependencies:**

- **Frontend:** React with custom bar chart implementation
- **Styling:** Dynamic color assignment based on severity
- **Interactions:** Click handlers for filtering

**Performance Considerations:**

- Efficient percentage calculations
- Optimized rendering for dynamic data
- Smooth animations and transitions

**Error Handling & Edge Cases:**

- Empty state when no anomalies detected
- Handles missing severity data
- Graceful degradation for display errors

---

### 4. Feature Contribution Scatter Plot

**Component Name:** `FeatureScatter`

**Purpose & Functionality:**

- Interactive scatter plot for exploring anomalous customers across different features
- Enables correlation analysis between customer attributes
- Supports dynamic axis selection for multi-dimensional analysis

**Data Source & Flow:**

- **Data Source:** Anomaly data points with feature contributions
- **Processing:** Multi-dimensional feature analysis
- **Available Features:** Anomaly Score, Transaction Count, Total Amount, Average Amount, Severity Level

**Data Representation:**

- Interactive scatter plot with selectable X/Y axes
- Color-coded points by severity level (1-5)
- Feature selection dropdowns for axes
- Legend showing severity levels
- Feature contribution summary cards

**User Interaction:**

- Select different features for X and Y axes
- Click points to investigate specific customers
- Hover tooltips with customer details
- Interactive legend for severity filtering

**AI Integration Context:**

- Feature correlation insights
- Customer outlier analysis
- Pattern recognition across dimensions
- Investigation recommendations

**Technical Dependencies:**

- **Frontend:** React, Recharts (ScatterChart, Scatter)
- **Data Processing:** Dynamic feature selection and plotting
- **UI:** Dropdown selectors for axis configuration

**Performance Considerations:**

- Efficient data transformation for plotting
- Optimized rendering for large datasets
- Smart point sizing and color management

**Error Handling & Edge Cases:**

- Handles missing feature data
- Validates plot coordinates
- Fallback for invalid feature selections

---

### 5. Anomalous Customers Table

**Component Name:** `AnomalyTable`

**Purpose & Functionality:**

- Comprehensive table view of top anomalous customers
- Sortable columns for different analysis perspectives
- Detailed customer information with feature breakdowns

**Data Source & Flow:**

- **Data Source:** Ranked list of anomalous customers
- **Processing:** Multi-column sorting and filtering
- **Display Limit:** Configurable (default 15 rows)

**Data Representation:**

- Sortable table with columns:
  - Customer Name and ID
  - Anomaly Score (color-coded)
  - Severity Level (badge format)
  - Total Amount and Transaction Count
  - Geographic Information (Region, State, Country)
  - Top Contributing Features (truncated list)

**User Interaction:**

- Click column headers to sort
- Click rows for detailed customer analysis
- Visual sorting indicators (arrows)
- Hover effects for row highlighting
- Shift+Click for multi-customer AI analysis

**AI Integration Context:**

- Individual customer analysis
- Comparative customer insights
- Feature-based investigation recommendations
- Geographic pattern analysis

**Technical Dependencies:**

- **Frontend:** React with custom table implementation
- **Sorting:** Multi-column sorting logic
- **Styling:** Dynamic row styling and badge components

**Performance Considerations:**

- Efficient sorting algorithms
- Virtualization for large datasets
- Optimized rendering with row memoization

**Error Handling & Edge Cases:**

- Handles missing customer data
- Graceful sorting fallbacks
- Empty state for no anomalies

---

### 6. Time Series Analysis Chart

**Component Name:** `TimeSeriesAnalysis`

**Purpose & Functionality:**

- Shows anomaly trend evolution over the last 30 days
- Provides temporal analysis of anomaly patterns
- Supports trend identification and forecasting insights

**Data Source & Flow:**

- **Data Source:** Daily aggregated anomaly metrics
- **Time Range:** Configurable (default 30 days)
- **Processing:** Time series aggregation and smoothing

**Data Representation:**

- Line chart showing anomaly score trends
- Date-based X-axis with daily granularity
- Trend indicators and pattern recognition
- Statistical overlays (moving averages, confidence intervals)

**User Interaction:**

- Hover for daily anomaly details
- Click for specific date analysis
- Zoom and pan capabilities
- Time range selection

**AI Integration Context:**

- Trend analysis and pattern recognition
- Forecasting insights and predictions
- Seasonal pattern identification
- Anomaly spike investigation

**Technical Dependencies:**

- **Frontend:** React, Recharts (LineChart, Line)
- **Data Processing:** Time series calculations
- **Date Handling:** Date formatting and manipulation

**Performance Considerations:**

- Efficient time series data processing
- Optimized chart rendering
- Smart data point sampling for large ranges

**Error Handling & Edge Cases:**

- Handles missing time series data
- Graceful fallback for date parsing errors
- Empty state for insufficient data

---

### 7. Customer Segmentation Overview

**Component Name:** `CustomerSegmentation`

**Purpose & Functionality:**

- Displays customer segment distribution and anomaly rates
- Shows which customer segments are most affected by anomalies
- Provides segment-based analysis and insights

**Data Source & Flow:**

- **Data Source:** Customer segment data with anomaly overlays
- **Processing:** Segment-based aggregation and rate calculations
- **Segments:** Based on customer monetary bands and categories

**Data Representation:**

- Segment cards showing:
  - Segment name and customer count
  - Anomaly rate percentage
  - Trend indicators
  - Risk level assessment

**User Interaction:**

- Click segments for detailed analysis
- Hover for additional segment metrics
- Interactive segment comparison

**AI Integration Context:**

- Segment-specific anomaly insights
- Cross-segment comparative analysis
- Targeted intervention strategies
- Segment risk assessment

**Technical Dependencies:**

- **Frontend:** React with card-based layout
- **Data Processing:** Segment aggregation algorithms
- **Styling:** Dynamic styling based on risk levels

**Performance Considerations:**

- Efficient segment calculations
- Optimized rendering for multiple segments
- Cached segment statistics

**Error Handling & Edge Cases:**

- Handles missing segment data
- Graceful fallback for calculation errors
- Empty state for no segments

---

### 8. Deep Dive Analysis Components

**Component Names:** `RootCauseAnalysis`, `CustomerComparison`, `FeatureImportance`

**Purpose & Functionality:**

- Provides detailed analysis for specific anomalous customers
- Shows root cause analysis, peer comparisons, and feature importance
- Enables deep investigation of individual anomaly cases

**Data Source & Flow:**

- **Data Source:** Customer-specific anomaly analysis
- **Processing:** Feature importance calculations and peer matching
- **Trigger:** Activated when specific customer selected

**Data Representation:**

- **Root Cause Analysis:** Feature contribution breakdown
- **Customer Comparison:** Side-by-side metrics with peer group
- **Feature Importance:** Ranked list of contributing factors

**User Interaction:**

- Appears when customer selected from table
- Interactive feature exploration
- Comparative analysis tools

**AI Integration Context:**

- Customer-specific insights and recommendations
- Root cause identification
- Intervention strategy suggestions

**Technical Dependencies:**

- **Frontend:** React with specialized analysis components
- **Data Processing:** Advanced statistical analysis
- **Visualization:** Custom charts and comparison views

---

### 9. What-If Simulation

**Component Name:** `WhatIfSimulation`

**Purpose & Functionality:**

- Interactive simulation tool for exploring feature impact on anomaly scores
- Allows adjustment of key customer features to see projected outcomes
- Provides scenario planning and intervention testing

**Data Source & Flow:**

- **Data Source:** Customer baseline features and simulation models
- **Processing:** Real-time anomaly score recalculation
- **Models:** Statistical models for feature impact prediction

**Data Representation:**

- Interactive sliders for key features
- Real-time anomaly score updates
- Before/after comparison views
- Impact visualization charts

**User Interaction:**

- Adjust feature sliders to test scenarios
- Real-time feedback on score changes
- Reset to baseline functionality
- Save simulation scenarios

**AI Integration Context:**

- Scenario analysis and recommendations
- Optimal intervention strategies
- Feature sensitivity insights

**Technical Dependencies:**

- **Frontend:** React with slider components
- **Processing:** Real-time calculation engines
- **Visualization:** Dynamic chart updates

**Performance Considerations:**

- Real-time calculation optimization
- Efficient model evaluation
- Smooth slider interactions

---

### 10. Risk Scoring and Alerts

**Component Name:** `RiskScoring`

**Purpose & Functionality:**

- Prioritized list of risk alerts and recommended actions
- Provides actionable insights for anomaly resolution
- Shows impact assessment and time-sensitive recommendations

**Data Source & Flow:**

- **Data Source:** Risk assessment algorithms
- **Processing:** Priority ranking and action recommendations
- **Updates:** Real-time risk score calculations

**Data Representation:**

- Prioritized alert cards with:
  - Risk level (Critical, High, Medium)
  - Customer impact assessment
  - Recommended actions
  - Time to act indicators

**User Interaction:**

- Click alerts for detailed investigation
- Action button for recommended steps
- Priority sorting and filtering

**AI Integration Context:**

- Risk prioritization insights
- Action effectiveness predictions
- Resource allocation recommendations

**Technical Dependencies:**

- **Frontend:** React with alert card components
- **Processing:** Risk scoring algorithms
- **Styling:** Priority-based color coding

---

### 11. Forecasting Components

**Component Name:** `ForecastCards`

**Purpose & Functionality:**

- Near-term forecasts and risk outlook
- Predictive analytics for anomaly trends
- Forward-looking insights for proactive management

**Data Source & Flow:**

- **Data Source:** Historical anomaly patterns
- **Processing:** Forecasting algorithms and trend analysis
- **Time Horizon:** Configurable forecast periods

**Data Representation:**

- Forecast overview cards showing:
  - Predicted anomaly rates
  - Risk factor trends
  - Confidence intervals
  - Seasonal adjustments

**User Interaction:**

- Interactive forecast exploration
- Time horizon selection
- Confidence level adjustments

**AI Integration Context:**

- Predictive insights and recommendations
- Proactive intervention strategies
- Resource planning guidance

**Technical Dependencies:**

- **Frontend:** React with forecast visualization
- **Processing:** Time series forecasting models
- **Data Science:** Statistical forecasting libraries

---

## Data Flow Architecture - Anomaly Detection Dashboard

### Primary Data Sources

- **Database:** SQLite (`customers.db`)
- **Tables:**
  - `dbo_D_Customer` (customer master data)
  - `dbo_F_Sales_Transaction` (transaction records)
  - `dbo_D_Item` (product information)

### API Endpoints

- **`/api/anomaly`** - Main anomaly detection data
- **`/api/anomaly-filter-options`** - Filter options for anomaly analysis

### Data Processing Pipeline

1. **Customer Metrics Calculation** → Statistical analysis of customer behavior
2. **Baseline Establishment** → Calculate normal behavior patterns
3. **Anomaly Detection** → Identify deviations using statistical methods
4. **Severity Classification** → Rank anomalies by severity (1-5)
5. **Feature Attribution** → Identify contributing factors
6. **Risk Assessment** → Calculate risk scores and recommendations

### Anomaly Detection Algorithm

- **Method:** Z-score based statistical analysis
- **Features:** Transaction count, total amount, average amount, recency, product diversity
- **Thresholds:** Configurable anomaly score thresholds
- **Severity Calculation:** `Math.ceil(anomalyScore * 5)`

---

## Shared AI Integration System

### Component Interaction Context

Both dashboards implement a sophisticated AI integration system that allows users to:

1. **Single Component Analysis** - Click any component to get AI insights
2. **Multi-Component Analysis** - Shift+Click multiple components to combine context
3. **Contextual Recommendations** - AI provides insights based on selected data

### AI Context Structure

```typescript
interface ComponentContext {
  componentType: string;
  componentId: string;
  data: any;
  insights: string[];
  metadata: {
    title?: string;
    description?: string;
    value?: string | number;
    trend?: "up" | "down" | "stable";
  };
}
```

### Integration Features

- **Keyboard Shortcuts:** Shift+Enter to send selected components to AI chat
- **Visual Feedback:** Selected components highlighted with indicators
- **Context Persistence:** Selected context maintained across interactions
- **Smart Insights:** AI generates contextual recommendations based on component combinations

---

## Technical Architecture Overview

### Frontend Stack

- **Framework:** Next.js 14 with App Router
- **UI Library:** React 18 with TypeScript
- **Styling:** Tailwind CSS with shadcn/ui components
- **Charts:** Recharts for data visualization
- **Icons:** Lucide React
- **State Management:** React Context API with custom hooks

### Backend Stack

- **Runtime:** Node.js with Next.js API routes
- **Database:** SQLite with better-sqlite3
- **Data Processing:** Custom statistical analysis algorithms
- **API Design:** RESTful endpoints with TypeScript interfaces

### Performance Optimizations

- **Caching:** API response caching and memoization
- **Lazy Loading:** Component-level code splitting
- **Virtualization:** Large dataset handling with virtual scrolling
- **Debouncing:** Filter and search input optimization
- **Memoization:** Expensive calculation caching

### Security Considerations

- **Database Access:** Read-only database connections
- **Input Validation:** Comprehensive parameter validation
- **Error Handling:** Graceful error boundaries and fallbacks
- **SQL Injection Prevention:** Prepared statements and parameterized queries

---

## Development Guidelines

### Component Development

- All components must implement `useComponentInsights` hook
- Follow consistent naming conventions and file structure
- Include comprehensive error handling and loading states
- Implement responsive design patterns

### Data Handling

- Use TypeScript interfaces for all data structures
- Implement proper error boundaries and fallback states
- Follow consistent API response formats
- Include data validation at component boundaries

### Testing Strategy

- Unit tests for utility functions and calculations
- Integration tests for API endpoints
- Component testing with React Testing Library
- End-to-end testing for critical user flows

### Documentation Requirements

- Comprehensive JSDoc comments for all functions
- README files for complex components
- API endpoint documentation with examples
- Performance benchmarking documentation

This documentation serves as the comprehensive technical reference for both Customer Analytics dashboards, providing developers and stakeholders with detailed insights into system architecture, component functionality, and integration patterns.
