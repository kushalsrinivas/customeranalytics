# Anomaly Detection System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture & Data Flow](#architecture--data-flow)
3. [Core Components](#core-components)
4. [API Layer](#api-layer)
5. [Data Models & Types](#data-models--types)
6. [Database Integration](#database-integration)
7. [Component Breakdown](#component-breakdown)
8. [Features & Functionality](#features--functionality)
9. [AI Integration & Context System](#ai-integration--context-system)
10. [Advanced Analytics](#advanced-analytics)

---

## System Overview

The Anomaly Detection System is a sophisticated customer analytics platform that identifies unusual customer behavior patterns using statistical analysis and machine learning techniques. It processes customer transaction data from a SQLite database and provides real-time insights through an interactive dashboard.

### Key Capabilities

- **Real-time Anomaly Detection**: Identifies customers with unusual behavior patterns
- **Multi-dimensional Analysis**: Analyzes 6 key behavioral features
- **Statistical Scoring**: Uses z-score normalization and baseline comparison
- **Interactive Filtering**: Advanced filtering by severity, region, date range, and score thresholds
- **Predictive Analytics**: Forecasting and risk assessment
- **AI-Powered Insights**: Contextual analysis and recommendations

---

## Architecture & Data Flow

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   SQLite DB     │ -> │   API Layer      │ -> │  React Frontend │
│   (customers.db)│    │   (/api/anomaly) │    │   (anomaly/page)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        v                       v                       v
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Data Processing │    │ Statistical      │    │ Interactive     │
│ & Aggregation   │    │ Analysis &       │    │ Visualization   │
│                 │    │ Scoring          │    │ & Filtering     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow Process

1. **Data Extraction**: Raw customer and transaction data from SQLite database
2. **Metric Calculation**: Aggregation of customer behavioral metrics
3. **Baseline Computation**: Statistical baseline calculation across all customers
4. **Anomaly Detection**: Z-score analysis and anomaly scoring
5. **Filtering & Ranking**: Application of user-defined filters and sorting
6. **Visualization**: Real-time rendering of charts, tables, and insights

---

## Core Components

### 1. Main Page Component (`/src/app/anomaly/page.tsx`)

The primary orchestrator component that manages the entire anomaly detection workflow.

**Key Responsibilities:**

- State management for filters, data, and loading states
- API data fetching with filter parameters
- Context sharing with dashboard provider
- Error handling and fallback data structures

**State Structure:**

```typescript
interface PageState {
  data: AnomalyDashboardData | null;
  loading: boolean;
  filters: AnomalyFilters;
  featureImportance: AnomalousFeature[];
  comparisonItems: CustomerComparisonItem[];
  simulation: SimulationData;
}
```

**Data Fetching Flow:**

1. Builds URL parameters from current filters
2. Fetches main dashboard data from `/api/anomaly`
3. Fetches additional data for top customer (feature importance, comparison, simulation)
4. Updates context for cross-component data sharing
5. Handles loading states and error scenarios

### 2. Filter System (`/src/components/anomaly/anomaly-filters.tsx`)

Advanced filtering interface that allows users to customize anomaly detection parameters.

**Filter Categories:**

- **Severity Levels**: 1-5 scale filtering (Low to Critical)
- **Minimum Anomaly Score**: 0.0-1.0 threshold slider
- **Market Segments**: Database-driven region filtering
- **Date Range**: Custom date range selection
- **Future Extensions**: Country and customer segment filtering

**Database Mapping:**

```sql
-- Market Segments UI → filters.regions → c."Market Desc" in DB
-- Examples: "Clubs & Resorts", "Corporate", "Education"

-- Countries → c."Customer Country" in DB
-- Examples: "United States", "Canada", "Mexico"

-- Customer Segments → c."Monetary Band" in DB
-- Examples: "Big", "Medium", "Small"
```

**Filter State Management:**

- Real-time filter application
- Active filter visualization with badges
- Individual filter removal capability
- Complete filter reset functionality

---

## API Layer

### Primary Endpoint: `/api/anomaly/route.ts`

**Request Parameters:**

```typescript
interface RequestParams {
  severityLevels?: number[]; // [1,2,3,4,5]
  regions?: string[]; // Market segments
  dateRange?: { start: string; end: string };
  minScore?: number; // 0.0-1.0
  minSeverity?: number; // 1-5
}
```

**Response Structure:**

```typescript
interface AnomalyResponse {
  // Core anomaly data
  anomalies: AnomalyDataPoint[];
  severityDistribution: SeverityDistributionItem[];
  featureContributions: FeatureContributionSummary[];
  kpis: AnomalyKPI;

  // Extended dashboard data
  regionDistribution: RegionDistributionItem[];
  categoryDistribution: CategoryDistributionItem[];
  segmentSummary: SegmentSummaryItem[];
  timeSeriesData: TimeSeriesPoint[];
  riskAlerts: RiskAlertItem[];
  forecasts: {
    overview: ForecastOverviewItem[];
    perCustomer: PerCustomerForecastItem[];
  };
  appliedFilters: AnomalyFilters;
}
```

**Data Processing Pipeline:**

1. **Parameter Parsing**: Extracts and validates filter parameters
2. **Parallel Data Fetching**: Simultaneous calls to multiple data functions
3. **Data Aggregation**: Combines all data sources into unified response
4. **Error Handling**: Graceful fallback with empty data structures

### Supporting Endpoints

**Filter Options API**: `/api/anomaly-filter-options/route.ts`

- Provides available filter values (regions, countries, segments)
- Dynamically loaded from database schema

---

## Data Models & Types

### Core Anomaly Types (`/src/types/anomaly.ts`)

**AnomalyDataPoint**: Primary anomaly record

```typescript
interface AnomalyDataPoint {
  customerId: number;
  customerName: string;
  anomalyScore: number; // 0-1 normalized score
  severity: number; // 1-5 severity level
  region: string; // Market segment
  state: string;
  country: string;
  detectionDate: string; // ISO timestamp
  transactionCount: number;
  totalAmount: number;
  avgAmount: number;
  segment: string; // Customer segment
  features: AnomalousFeature[]; // Individual feature contributions
}
```

**AnomalousFeature**: Individual feature analysis

```typescript
interface AnomalousFeature {
  name: string; // Feature identifier
  value: number; // Actual customer value
  normalRange: [number, number]; // Expected range (μ ± 2σ)
  severity: number; // 1-5 feature-level severity
  zScore: number; // Statistical z-score
  contribution: number; // Percentage contribution (0-100)
}
```

**Key Features Analyzed:**

1. `transactionCount`: Number of transactions
2. `totalAmount`: Total transaction value
3. `avgAmount`: Average transaction value
4. `uniqueProducts`: Number of unique products purchased
5. `daysSinceLastTransaction`: Days since last purchase
6. `avgDaysBetweenTransactions`: Average purchase interval

### Statistical Models

**BaselineStats**: Population baseline for each feature

```typescript
interface BaselineStats {
  mean: number; // Population average
  std: number; // Standard deviation
  min: number; // Minimum observed value
  max: number; // Maximum observed value
}
```

**Anomaly Scoring Algorithm:**

```typescript
// For each feature:
const zScore = (customerValue - populationMean) / populationStd;
const contribution = Math.min(Math.abs(zScore) / 3, 1); // Normalized 0-1
const severity = Math.min(Math.ceil(Math.abs(zScore)), 5); // 1-5 scale

// Overall anomaly score:
const anomalyScore = averageContribution; // Mean of all feature contributions
const overallSeverity = Math.min(Math.ceil(anomalyScore * 5), 5);
```

---

## Database Integration

### Database Schema (`/src/lib/customers.db`)

**Primary Tables:**

- `dbo_D_Customer`: Customer master data
- `dbo_F_Sales_Transaction`: Transaction records
- `dbo_F_Customer_Loyalty`: Customer loyalty metrics

**Key Customer Metrics Query:**

```sql
SELECT
  c."Customer Key"        as customerId,
  c."Customer Name"       as customerName,
  c."Customer State/Prov" as state,
  c."Customer Country"    as country,
  c."Market Desc"         as region,
  c."Monetary Band"       as segment,
  COUNT(st."Sales Txn Key")                                   as transactionCount,
  COALESCE(SUM(st."Net Sales Amount"), 0)                     as totalAmount,
  COALESCE(AVG(st."Net Sales Amount"), 0)                     as avgAmount,
  COUNT(DISTINCT st."Item Key")                                as uniqueProducts,
  JULIANDAY('now') - MAX(JULIANDAY(st."Txn Date"))            as daysSinceLastTransaction,
  CASE
    WHEN COUNT(st."Sales Txn Key") > 1
      THEN (JULIANDAY(MAX(st."Txn Date")) - JULIANDAY(MIN(st."Txn Date"))) / (COUNT(st."Sales Txn Key") - 1)
      ELSE 0
  END as avgDaysBetweenTransactions
FROM "dbo_D_Customer" c
LEFT JOIN "dbo_F_Sales_Transaction" st ON c."Customer Key" = st."Customer Key"
WHERE c."Sales Activity Flag" = 1
GROUP BY c."Customer Key", c."Customer Name", c."Customer State/Prov",
         c."Customer Country", c."Market Desc", c."Monetary Band"
HAVING COUNT(st."Sales Txn Key") > 0
ORDER BY totalAmount DESC
LIMIT 5000
```

### Data Processing Functions (`/src/lib/anomaly-data.ts`)

**Core Processing Pipeline:**

1. **getCustomerMetrics()**: Raw data extraction and aggregation
2. **calculateBaseline()**: Statistical baseline computation
3. **calculateAnomalies()**: Z-score analysis and scoring
4. **applyFilters()**: Filter application and data subset selection

**Statistical Analysis:**

```typescript
function calculateBaseline(rows: MetricRow[]): BaselineMap {
  const baseline = {} as BaselineMap;
  for (const feature of FEATURE_KEYS) {
    const values = rows
      .map((r) => r[feature])
      .filter((v) => Number.isFinite(v));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    baseline[feature] = {
      mean,
      std,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }
  return baseline;
}
```

---

## Component Breakdown

### 1. KPI Tiles (`/src/components/anomaly/kpi-tiles.tsx`)

**Purpose**: High-level metrics dashboard providing key anomaly statistics

**Displayed Metrics:**

- **Anomaly Rate**: Percentage of customers flagged as anomalous
- **High Severity Count**: Number of severity 4-5 cases
- **Top Feature**: Most frequently anomalous feature
- **Mean Score**: Average anomaly score across all flagged customers
- **New Anomalies**: Count of anomalies detected in last 24 hours

**Interactive Features:**

- Click-to-analyze with AI insights
- Multi-select mode for comparative analysis
- Real-time metric updates based on filter changes

**AI Integration:**
Each KPI tile includes contextual insights:

```typescript
generateInsights: (data) => {
  if (tile.label === "Anomaly Rate") {
    if (data.rawValue > 10) {
      return ["High anomaly rate detected - requires immediate investigation"];
    } else if (data.rawValue > 5) {
      return ["Moderate anomaly rate - monitor for trends"];
    }
    return ["Low anomaly rate - system operating normally"];
  }
  // ... additional insight logic
};
```

### 2. Anomaly Table (`/src/components/anomaly/anomaly-table.tsx`)

**Purpose**: Detailed customer-level anomaly data with sortable interface

**Key Features:**

- **Dynamic Sorting**: Sort by any column (score, severity, amount, etc.)
- **Top Feature Display**: Shows 3 most contributing features per customer
- **Severity Color Coding**: Visual severity indication
- **Row-level Insights**: Click any row for detailed AI analysis
- **Responsive Design**: Optimized for various screen sizes

**Data Presentation:**

```typescript
interface TableRow {
  customerInfo: {name: string, id: number};
  anomalyMetrics: {score: number, severity: 1-5};
  businessMetrics: {totalAmount: number, transactionCount: number};
  locationInfo: {region: string, state: string, country: string};
  topFeatures: AnomalousFeature[]; // Top 3 contributors
}
```

**Interactive Capabilities:**

- Row selection triggers detailed customer analysis
- Multi-select mode for batch analysis
- Integrated with AI insight system
- Real-time filtering and sorting

### 3. Severity Distribution (`/src/components/anomaly/severity-distribution.tsx`)

**Purpose**: Visual breakdown of anomaly severity levels across customer base

**Visualization**: Donut chart showing severity level distribution

- Level 1 (Low): Blue (#00e0ff)
- Level 2 (Low-Med): Cyan (#5fd4d6)
- Level 3 (Medium): Blue (#5891cb)
- Level 4 (High): Purple (#aa45dd)
- Level 5 (Critical): Magenta (#e930ff)

**Calculations:**

```typescript
interface SeverityDistributionItem {
  level: number; // 1-5
  count: number; // Number of customers at this level
  percentage: number; // Percentage of total anomalies
  color: string; // Hex color code
}
```

### 4. Feature Scatter Plot (`/src/components/anomaly/feature-scatter.tsx`)

**Purpose**: Correlation analysis between different anomalous features

**Visualization**: Interactive scatter plot showing:

- X-axis: Selected feature contribution
- Y-axis: Anomaly score
- Point size: Customer transaction volume
- Color: Severity level

**Interactive Features:**

- Feature selection dropdown
- Hover tooltips with customer details
- Zoom and pan capabilities
- Click-to-drill-down functionality

### 5. Advanced Analytics Components

**Time Series Analysis**: Historical anomaly trends
**Customer Segmentation**: Segment-based anomaly analysis  
**Root Cause Analysis**: Feature-level contribution analysis
**Risk Scoring**: Prioritized alert system
**Forecasting**: Predictive anomaly modeling

---

## Features & Functionality

### 1. Real-time Filtering System

**Multi-dimensional Filtering:**

- **Severity Levels**: Toggle individual severity levels (1-5)
- **Score Threshold**: Adjustable minimum anomaly score (0.0-1.0)
- **Market Segments**: Database-driven region selection
- **Date Range**: Custom time period analysis
- **Future Extensions**: Country and customer segment filters

**Filter State Management:**

- Persistent filter state across page navigation
- URL parameter synchronization
- Real-time data updates
- Visual filter indicators

### 2. Statistical Analysis Engine

**Baseline Calculation:**

- Population-wide statistical baselines for each feature
- Dynamic recalculation based on filter selection
- Robust statistical measures (mean, standard deviation, min/max)

**Anomaly Detection Algorithm:**

```typescript
// Z-score calculation for each feature
const zScore = Math.abs((customerValue - populationMean) / populationStd);

// Contribution scoring (0-1 normalized)
const contribution = Math.min(zScore / 3, 1);

// Severity assignment (1-5 scale)
const severity = Math.min(Math.ceil(zScore), 5);

// Overall anomaly score (average of all feature contributions)
const anomalyScore = totalContribution / numberOfFeatures;
```

### 3. Interactive Visualization Suite

**Chart Types:**

- **KPI Tiles**: Key metric overview
- **Data Table**: Sortable customer list
- **Donut Chart**: Severity distribution
- **Scatter Plot**: Feature correlation analysis
- **Radar Chart**: Multi-dimensional customer profiles
- **Time Series**: Historical trend analysis

**Interaction Patterns:**

- Click-to-analyze with AI insights
- Shift+click for multi-select analysis
- Hover tooltips for quick information
- Drill-down navigation capabilities

### 4. Predictive Analytics

**Risk Assessment:**

- Customer churn risk calculation
- Financial impact estimation
- Urgency scoring based on multiple factors
- Recommended action suggestions

**Forecasting Models:**

- Next-week anomaly score prediction
- Next-month trend projection
- Confidence intervals for predictions
- Historical accuracy tracking

---

## AI Integration & Context System

### 1. Component-level Insights (`/src/hooks/use-component-insights.ts`)

**Purpose**: Provides contextual AI analysis for any dashboard component

**Implementation Pattern:**

```typescript
const componentInsights = useComponentInsights({
  componentType: "Anomaly KPI Tile",
  componentId: "anomaly-rate-kpi",
  data: { value: kpis.anomalyRate, trend: "increasing" },
  generateInsights: (data) => {
    // Custom insight generation logic
    return ["Anomaly rate has increased by 15% this week"];
  },
  metadata: { title: "Anomaly Rate", value: "8.5%" },
});
```

**Features:**

- **Single-click Analysis**: Instant insights on component click
- **Multi-select Mode**: Comparative analysis across components
- **Context Aggregation**: Intelligent context combination
- **Background Processing**: Non-blocking AI analysis

### 2. Multi-Component Analysis

**Shift+Click Selection:**

- Hold Shift to enter multi-select mode
- Click multiple components to build analysis context
- Visual selection indicators
- Batch AI analysis capability

**Context Aggregation:**

```typescript
const contextSummary = selectedContexts
  .map((context) => {
    const { componentType, metadata, insights, data } = context;
    return `**${componentType}** - ${metadata.title}: ${insights.join(", ")}`;
  })
  .join("\n\n");
```

### 3. AI-Powered Recommendations

**Risk Alert System:**

- Automated priority assessment
- Suggested action items
- Confidence scoring
- Time-to-action estimates

**Insight Categories:**

- **Trend Analysis**: Pattern identification over time
- **Comparative Analysis**: Peer group comparisons
- **Root Cause**: Feature-level contribution analysis
- **Predictive**: Future risk assessment

---

## Advanced Analytics

### 1. Customer Deep Dive Analysis

**Feature Importance Analysis:**

- Individual customer feature breakdown
- Contribution percentages for each anomalous feature
- Comparison with population baselines
- Severity assessment per feature

**Peer Comparison:**

```typescript
interface CustomerComparisonItem {
  metric: string; // "Avg Transaction Value"
  customer: number; // Customer's actual value
  peer: number; // Peer group average
  difference: number; // Percentage difference
  trend: "up" | "down" | "stable"; // Direction indicator
}
```

### 2. What-If Simulation

**Purpose**: Interactive feature manipulation to understand anomaly drivers

**Capabilities:**

- Adjust key customer features
- Real-time anomaly score recalculation
- Visual impact assessment
- Scenario comparison

**Implementation:**

- Baseline feature statistics for population
- Customer current feature snapshot
- Interactive sliders for feature adjustment
- Dynamic score recalculation

### 3. Time Series Analytics

**Historical Analysis:**

- 30-day anomaly score trends
- Transaction volume correlation
- Seasonal pattern detection
- Trend direction analysis

**Calculation Method:**

```typescript
// Daily anomaly score based on transaction volume deviation
const dailyScore = Math.min(
  Math.abs((dailyTransactionCount - historicalMean) / historicalStd) / 3,
  1
);
```

### 4. Regional and Segment Analysis

**Geographic Distribution:**

- Anomaly rates by market segment
- Regional risk assessment
- Geographic trend analysis
- Market-specific insights

**Segment Performance:**

- Customer segment anomaly rates
- Segment-specific baselines
- Cross-segment comparison
- Targeted recommendations

---

## Technical Implementation Details

### 1. Performance Optimizations

**Database Optimization:**

- Indexed customer and transaction tables
- Optimized SQL queries with proper JOINs
- Limited result sets (5000 customers max)
- Efficient aggregation queries

**Frontend Optimization:**

- React Suspense for component loading
- Memoized calculations with useMemo
- Lazy loading for large datasets
- Efficient re-rendering patterns

### 2. Error Handling & Resilience

**API Layer:**

- Graceful error handling with fallback data
- Request timeout management
- Parameter validation
- Structured error responses

**Frontend Resilience:**

- Loading states for all data operations
- Error boundaries for component isolation
- Fallback UI components
- User-friendly error messages

### 3. State Management

**Context Architecture:**

```typescript
interface DashboardContextType {
  anomalyData: ExtendedAnomalyData | null;
  setAnomalyData: (data: ExtendedAnomalyData | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  currentPage: string;
}
```

**Data Flow:**

1. Page-level state management
2. Context sharing across components
3. Filter state synchronization
4. Real-time data updates

### 4. Security & Data Privacy

**Data Protection:**

- Server-side data processing
- No sensitive data in client state
- Secure API endpoints
- Database connection security

**Access Control:**

- Component-level access patterns
- Data filtering at API layer
- User session management
- Audit trail capability

---

## Future Enhancements

### 1. Machine Learning Integration

- Advanced anomaly detection algorithms
- Automated feature selection
- Ensemble model predictions
- Continuous learning capabilities

### 2. Real-time Processing

- Streaming data integration
- Real-time anomaly alerts
- Live dashboard updates
- Event-driven architecture

### 3. Advanced Visualizations

- 3D scatter plots
- Network analysis graphs
- Geospatial visualizations
- Interactive timeline analysis

### 4. Export & Reporting

- PDF report generation
- Excel data export
- Scheduled reporting
- Email alert system

---

This comprehensive documentation covers the entire anomaly detection system, from high-level architecture to detailed implementation specifics. The system represents a sophisticated approach to customer analytics with real-time processing, interactive visualizations, and AI-powered insights.
