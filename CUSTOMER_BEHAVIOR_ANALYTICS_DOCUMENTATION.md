# Customer Behavior Analytics System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture & Data Flow](#architecture--data-flow)
3. [Core Components](#core-components)
4. [API Layer](#api-layer)
5. [Data Models & Types](#data-models--types)
6. [Database Integration](#database-integration)
7. [Component Breakdown](#component-breakdown)
8. [Analysis Features](#analysis-features)
9. [Interactive Visualizations](#interactive-visualizations)
10. [AI Integration & Insights](#ai-integration--insights)
11. [Advanced Analytics](#advanced-analytics)

---

## System Overview

The Customer Behavior Analytics System is a comprehensive platform for analyzing customer purchase patterns, preferences, and engagement levels. It processes transactional data to provide deep insights into customer behavior across multiple dimensions including purchase frequency, product preferences, channel usage, and engagement patterns.

### Key Capabilities

- **Multi-dimensional Behavior Analysis**: RFM (Recency, Frequency, Monetary) analysis with extensions
- **Product Category Insights**: Category affinity analysis and treemap visualizations
- **Channel Behavior Analysis**: Multi-channel purchase pattern analysis
- **Engagement Segmentation**: Customer lifecycle and engagement level classification
- **Predictive Analytics**: Churn risk assessment and behavioral forecasting
- **Interactive Filtering**: Time-based, segment-based, and customer-specific analysis

---

## Architecture & Data Flow

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   SQLite DB     │ -> │   API Layer          │ -> │  React Frontend     │
│   (customers.db)│    │   (/api/customer-    │    │   (customer-        │
│                 │    │    behavior)         │    │    behavior/page)   │
└─────────────────┘    └──────────────────────┘    └─────────────────────┘
        │                       │                           │
        │                       │                           │
        v                       v                           v
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│ Transaction     │    │ Behavioral Metrics   │    │ Interactive         │
│ Processing &    │    │ Calculation &        │    │ Dashboards &        │
│ Aggregation     │    │ Pattern Analysis     │    │ Visualizations      │
└─────────────────┘    └──────────────────────┘    └─────────────────────┘
```

### Data Processing Pipeline

1. **Data Extraction**: Raw customer and transaction data from SQLite database
2. **Customer Grouping**: Transactions grouped by customer ID
3. **Behavioral Metrics**: Calculation of RFM metrics, diversity, loyalty scores
4. **Pattern Analysis**: Purchase pattern identification and classification
5. **Category & Channel Analysis**: Product and channel preference analysis
6. **Engagement Classification**: Customer lifecycle stage determination
7. **Visualization**: Real-time rendering of charts, matrices, and insights

---

## Core Components

### 1. Main Page Component (`/src/app/customer-behavior/page.tsx`)

The primary orchestrator component managing the customer behavior analysis workflow.

**Key Responsibilities:**

- State management for filters, data, and UI interactions
- API data fetching with dynamic parameter building
- Context sharing with dashboard provider
- Multi-tab interface management (Patterns, Preferences, Channels, Engagement)

**State Structure:**

```typescript
interface PageState {
  data: CustomerBehaviorData | null;
  loading: boolean;
  timeRange: string;
  selectedSegment?: string;
  selectedCustomer?: string;
  selectedProduct?: string;
  dateRange?: { start: string; end: string };
  highlightCategory?: string;
  highlightChannel?: string;
}
```

**Data Fetching Flow:**

1. Builds effective time range (including custom date ranges)
2. Calls `getCustomerBehaviorData()` with current filter parameters
3. Updates context for cross-component data sharing
4. Handles loading states and error recovery
5. Provides data to all child components

### 2. Filter System (`/src/components/customer-behavior/behavior-filters.tsx`)

Comprehensive filtering interface allowing users to customize analysis scope.

**Filter Categories:**

- **Time Period**: Monthly, Quarterly, Annual, YTD, Custom date range
- **Customer Segment**: Predefined segments (1-6)
- **Product Category**: Database-driven product category filtering
- **Customer Comparison**: Individual customer focus mode
- **Date Range**: Custom start/end date selection

**Filter State Management:**

- Real-time filter application with API calls
- Active filter badge display with individual removal
- Complete filter reset functionality
- URL parameter synchronization for bookmarking

---

## API Layer

### Primary Endpoint: `/api/customer-behavior/route.ts`

**Request Parameters:**

```typescript
interface RequestParams {
  timeRange?: string; // 'monthly', 'quarterly', 'annual', 'custom'
  segment?: string; // Customer segment ID
  productCategory?: string; // Product category filter
  customerId?: string; // Individual customer analysis
}
```

**Response Structure:**

```typescript
interface CustomerBehaviorData {
  kpis: BehaviorKPI; // Key performance indicators
  patterns: BehaviorPattern[]; // Individual customer patterns
  categoryAffinities: CategoryAffinity[]; // Product category preferences
  channelUsage: ChannelUsage[]; // Channel distribution
  engagementData: EngagementData[]; // Customer engagement levels
  timeRange: string; // Applied time range
  segment?: string; // Applied segment filter
}
```

**Data Processing Pipeline:**

1. **Parameter Parsing**: Time range calculation and filter validation
2. **Database Queries**: Customer and transaction data extraction
3. **Behavioral Processing**: Pattern calculation and analysis
4. **Aggregation**: Category, channel, and engagement analysis
5. **KPI Calculation**: Key metrics computation
6. **Response Formation**: Structured data response

### Time Period Processing

**Dynamic Time Range Calculation:**

```typescript
function parseTimePeriod(timeRange: string): {
  startDate: string;
  endDate: string;
} {
  const referenceDate = new Date("2021-01-01"); // Dataset reference point
  let startDate: Date, endDate: Date;

  switch (timeRange) {
    case "monthly":
      startDate = new Date(referenceDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "quarterly":
      startDate = new Date(referenceDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "annual":
      startDate = new Date(referenceDate.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      // Custom date range parsing
      if (timeRange.includes(":")) {
        const [start, end] = timeRange.split(":");
        return { startDate: start, endDate: end };
      }
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: referenceDate.toISOString().split("T")[0],
  };
}
```

---

## Data Models & Types

### Core Behavior Types (`/src/types/customer-behavior.ts`)

**BehaviorPattern**: Individual customer behavioral profile

```typescript
interface BehaviorPattern {
  customer_id: string;
  last_purchase_date: string; // ISO date string
  frequency: number; // Purchases per month
  avg_order_value: number; // Average transaction amount
  quantity: number; // Average items per transaction
  diversity: number; // Number of unique product categories
  loyalty: number; // Loyalty score (0-100)
  recency: number; // Days since last purchase
  churn_risk: "low" | "medium" | "high"; // Churn risk assessment
}
```

**CategoryAffinity**: Product category preferences

```typescript
interface CategoryAffinity {
  category: string; // Category name/identifier
  count: number; // Number of transactions
  spend: number; // Total spend amount
  percentage: number; // Percentage of total transactions
}
```

**ChannelUsage**: Multi-channel behavior analysis

```typescript
interface ChannelUsage {
  channel: string; // Channel identifier
  count: number; // Number of transactions
  spend: number; // Total spend amount
  percentage: number; // Percentage of total usage
}
```

**EngagementData**: Customer engagement classification

```typescript
interface EngagementData {
  customer_id: string;
  recency: number; // Days since last purchase
  frequency: number; // Purchase frequency
  engagement_level: "champions" | "loyal" | "promising" | "at_risk";
  spend_volume: number; // Total spend amount
}
```

### Key Performance Indicators

**BehaviorKPI**: Aggregated behavioral metrics

```typescript
interface BehaviorKPI {
  avgPurchaseInterval: number; // Average days between purchases
  avgOrderValue: number; // Average transaction value
  categoryDiversity: number; // Average categories per customer
  dominantChannel: string; // Most used channel
  dominantChannelPct: number; // Percentage usage of dominant channel
  churnRiskPct: number; // Percentage of high-risk customers
}
```

---

## Database Integration

### Database Schema Integration

**Primary Tables:**

- `dbo_D_Customer`: Customer master data with segments and demographics
- `dbo_F_Sales_Transaction`: Individual transaction records
- `dbo_F_Customer_Loyalty`: Customer loyalty and activity data

**Customer Data Query:**

```sql
SELECT DISTINCT
  c.[Customer Key] as customer_id,
  c.[Customer Name] as customer_name,
  c.[Customer Type Desc] as customer_type,
  c.[Customer Category Hrchy Code] as customer_category,
  c.[Customer Status] as customer_status,
  COALESCE(cl.[Loyalty Status], 'Unknown') as loyalty_status,
  cl.[First Activity Date] as customer_since,
  cl.[Last Activity Date] as last_activity_date
FROM dbo_D_Customer c
LEFT JOIN dbo_F_Customer_Loyalty cl ON c.[Customer Key] = cl.[Entity Key]
WHERE c.[Customer Key] > 0
```

**Transaction Data Query:**

```sql
SELECT
  [Customer Key] as customer_id,
  [Txn Date] as transaction_date,
  [Net Sales Amount] as sales_amount,
  [Net Sales Quantity] as quantity,
  [Item Key] as item_id,
  [Line Type] as sales_channel,
  [Item Category Hrchy Key] as product_category
FROM dbo_F_Sales_Transaction
WHERE [Txn Date] BETWEEN ? AND ?
  AND [Deleted Flag] = 0
  AND [Excluded Flag] = 0
  AND [Customer Key] > 0
```

### Behavioral Processing Logic

**Pattern Calculation Algorithm:**

```typescript
async function processCustomerBehaviorData(
  customerData: CustomerRecord[],
  transactionData: TransactionRecord[]
): Promise<Omit<CustomerBehaviorData, "timeRange" | "segment">> {
  // Group transactions by customer
  const customerTransactions = new Map<number, TransactionRecord[]>();
  transactionData.forEach((transaction) => {
    const customerId = transaction.customer_id;
    if (!customerTransactions.has(customerId)) {
      customerTransactions.set(customerId, []);
    }
    customerTransactions.get(customerId)!.push(transaction);
  });

  // Calculate behavior patterns for each customer
  const patterns: BehaviorPattern[] = [];
  const engagementData: EngagementData[] = [];

  for (const [customerId, transactions] of customerTransactions) {
    if (transactions.length < 2) continue; // Skip customers with insufficient data

    // Sort transactions by date
    transactions.sort(
      (a, b) =>
        new Date(a.transaction_date).getTime() -
        new Date(b.transaction_date).getTime()
    );

    // Calculate key metrics
    const firstPurchase = new Date(transactions[0].transaction_date);
    const lastPurchase = new Date(
      transactions[transactions.length - 1].transaction_date
    );
    const totalSpend = transactions.reduce((sum, t) => sum + t.sales_amount, 0);
    const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);
    const avgOrderValue = totalSpend / transactions.length;

    // Calculate frequency (transactions per month)
    const daysBetweenFirstAndLast =
      (lastPurchase.getTime() - firstPurchase.getTime()) /
      (1000 * 60 * 60 * 24);
    const frequency =
      daysBetweenFirstAndLast > 0
        ? transactions.length / (daysBetweenFirstAndLast / 30)
        : transactions.length;

    // Calculate diversity (unique product categories)
    const uniqueCategories = new Set(
      transactions.map((t) => t.product_category)
    ).size;

    // Calculate recency (days since last purchase)
    const recency = Math.floor(
      (Date.now() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate loyalty score (frequency + spend based)
    const loyalty = Math.min(
      100,
      Math.round(frequency * 10 + totalSpend / 100)
    );

    // Determine churn risk
    let churnRisk: "low" | "medium" | "high" = "low";
    if (recency > 90) churnRisk = "high";
    else if (recency > 45) churnRisk = "medium";

    // Create pattern record
    patterns.push({
      customer_id: customerId.toString(),
      last_purchase_date: lastPurchase.toISOString().split("T")[0],
      frequency: Math.round(frequency * 10) / 10,
      avg_order_value: Math.round(avgOrderValue * 100) / 100,
      quantity: Math.round(totalQuantity / transactions.length),
      diversity: uniqueCategories,
      loyalty,
      recency,
      churn_risk: churnRisk,
    });

    // Calculate engagement level
    let engagementLevel: "champions" | "loyal" | "promising" | "at_risk" =
      "at_risk";
    if (frequency >= 2 && recency <= 30) engagementLevel = "champions";
    else if (frequency >= 1 && recency <= 60) engagementLevel = "loyal";
    else if (frequency >= 0.5 && recency <= 90) engagementLevel = "promising";

    engagementData.push({
      customer_id: customerId.toString(),
      recency,
      frequency: Math.round(frequency * 10) / 10,
      engagement_level: engagementLevel,
      spend_volume: Math.round(totalSpend),
    });
  }

  // Calculate category affinities, channel usage, and KPIs
  // ... (additional processing logic)

  return {
    kpis,
    patterns,
    categoryAffinities,
    channelUsage: channelUsageArray,
    engagementData,
  };
}
```

---

## Component Breakdown

### 1. Behavior KPI Tiles (`/src/components/customer-behavior/behavior-kpi-tiles.tsx`)

**Purpose**: High-level behavioral metrics dashboard with trend indicators

**Displayed Metrics:**

- **Average Purchase Interval**: Days between purchases (with trend analysis)
- **Average Order Value**: Mean transaction value
- **Category Diversity**: Average categories per customer
- **Channel Mix**: Dominant channel with usage percentage
- **Churn Risk**: Percentage of high-risk customers

**Interactive Features:**

- Click-to-analyze with AI insights
- Trend indicators (up/down/stable arrows)
- Color-coded status indicators
- Multi-select mode for comparative analysis

**Trend Analysis Logic:**

```typescript
const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-3 w-3 text-green-400" />;
    case "down":
      return <TrendingDown className="h-3 w-3 text-red-400" />;
    default:
      return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
};
```

### 2. Pattern Radar Chart (`/src/components/customer-behavior/pattern-radar-chart.tsx`)

**Purpose**: Multi-dimensional visualization of customer behavior patterns

**Dimensions Analyzed:**

- **Frequency**: Purchase frequency (normalized to 0-100 scale)
- **Recency**: Days since last purchase (inverted - lower is better)
- **Order Value**: Average transaction amount
- **Quantity**: Items per transaction
- **Diversity**: Product category variety
- **Loyalty**: Calculated loyalty score

**Visualization Features:**

- Dual-layer radar chart (average vs. selected customer)
- Interactive legend
- Hover tooltips with detailed metrics
- Responsive design for various screen sizes

**Data Normalization:**

```typescript
const normalizeValue = (value: number, max: number) =>
  Math.round((value / max) * 100);

const radarData = [
  {
    metric: "Frequency",
    average: normalizeValue(avgMetrics.frequency / count, 20),
    selected: selectedCustomer
      ? normalizeValue(selectedCustomerFrequency, 20)
      : 0,
  },
  // ... additional metrics
];
```

### 3. Category Treemap (`/src/components/customer-behavior/category-treemap.tsx`)

**Purpose**: Hierarchical visualization of product category preferences

**Features:**

- **Proportional Sizing**: Rectangle size represents spend volume
- **Color Coding**: Different colors for category identification
- **Interactive Highlighting**: Click to highlight specific categories
- **Tooltip Information**: Detailed spend and transaction data

**Data Structure:**

```typescript
interface TreemapData {
  name: string; // Category name
  value: number; // Spend amount (determines size)
  percentage: number; // Percentage of total spend
  transactions: number; // Number of transactions
  color: string; // Category color
}
```

### 4. Channel Donut Chart (`/src/components/customer-behavior/channel-donut-chart.tsx`)

**Purpose**: Distribution analysis of customer channel preferences

**Visualization Elements:**

- **Donut Chart**: Channel distribution by usage percentage
- **Legend**: Channel names with color coding
- **Center Display**: Total channels and dominant channel info
- **Interactive Segments**: Click to highlight specific channels

### 5. Pattern Interval Histogram (`/src/components/customer-behavior/pattern-interval-histogram.tsx`)

**Purpose**: Distribution analysis of behavioral metrics across customer base

**Configurable Metrics:**

- **Recency**: Days since last purchase distribution
- **Frequency**: Purchase frequency distribution
- **Order Value**: Average order value distribution
- **Purchase Intervals**: Time between purchases

**Features:**

- Dynamic bin calculation for optimal visualization
- Statistical overlays (mean, median indicators)
- Interactive tooltips with customer counts
- Responsive bar chart implementation

### 6. Engagement Matrix (`/src/components/customer-behavior/engagement-matrix.tsx`)

**Purpose**: Customer lifecycle and engagement level visualization

**Engagement Levels:**

- **Champions**: High frequency, recent activity (frequency ≥ 2, recency ≤ 30)
- **Loyal**: Regular activity (frequency ≥ 1, recency ≤ 60)
- **Promising**: Moderate engagement (frequency ≥ 0.5, recency ≤ 90)
- **At Risk**: Low engagement or inactive

**Matrix Visualization:**

- **2D Grid**: Frequency (Y-axis) vs. Recency (X-axis)
- **Quadrant Coloring**: Different colors for each engagement level
- **Customer Plotting**: Individual customers plotted as points
- **Segment Statistics**: Count and percentage for each quadrant

### 7. Channel Journey Sankey (`/src/components/customer-behavior/channel-journey-sankey.tsx`)

**Purpose**: Customer journey flow analysis across different channels

**Features:**

- **Flow Visualization**: Channel transition patterns
- **Volume Representation**: Flow thickness represents customer volume
- **Multi-step Journeys**: Complex customer paths visualization
- **Interactive Exploration**: Click flows for detailed analysis

---

## Analysis Features

### 1. RFM Analysis (Recency, Frequency, Monetary)

**Extended RFM Model:**

- **Recency**: Days since last purchase
- **Frequency**: Purchase frequency per month
- **Monetary**: Average order value
- **Extensions**: Quantity, Diversity, Loyalty scores

**Scoring Algorithm:**

```typescript
// Recency Score (inverted - recent is better)
const recencyScore = Math.max(0, 100 - (recency / 365) * 100);

// Frequency Score (higher frequency is better)
const frequencyScore = Math.min(100, frequency * 10);

// Monetary Score (normalized to customer base)
const monetaryScore = (avgOrderValue / maxOrderValue) * 100;

// Composite Score
const overallScore = (recencyScore + frequencyScore + monetaryScore) / 3;
```

### 2. Customer Segmentation

**Engagement-Based Segmentation:**

```typescript
function classifyEngagement(
  frequency: number,
  recency: number
): EngagementLevel {
  if (frequency >= 2 && recency <= 30) return "champions";
  if (frequency >= 1 && recency <= 60) return "loyal";
  if (frequency >= 0.5 && recency <= 90) return "promising";
  return "at_risk";
}
```

**Segment Characteristics:**

- **Champions**: High-value, frequent, recent customers
- **Loyal**: Consistent, reliable customer base
- **Promising**: Growth potential customers
- **At Risk**: Require retention efforts

### 3. Churn Risk Assessment

**Risk Calculation:**

```typescript
function calculateChurnRisk(
  recency: number,
  frequency: number,
  loyalty: number
): ChurnRisk {
  let riskScore = 0;

  // Recency component (40% weight)
  if (recency > 90) riskScore += 40;
  else if (recency > 45) riskScore += 20;

  // Frequency component (30% weight)
  if (frequency < 1) riskScore += 30;
  else if (frequency < 2) riskScore += 15;

  // Loyalty component (30% weight)
  if (loyalty < 30) riskScore += 30;
  else if (loyalty < 60) riskScore += 15;

  if (riskScore >= 60) return "high";
  if (riskScore >= 30) return "medium";
  return "low";
}
```

### 4. Product Category Analysis

**Category Affinity Calculation:**

```typescript
// Calculate category preferences
const categorySpend = new Map<number, { count: number; spend: number }>();
transactionData.forEach((transaction) => {
  const category = transaction.product_category;
  if (!categorySpend.has(category)) {
    categorySpend.set(category, { count: 0, spend: 0 });
  }
  const current = categorySpend.get(category)!;
  current.count += 1;
  current.spend += transaction.sales_amount;
});

// Convert to affinity scores
const categoryAffinities: CategoryAffinity[] = Array.from(
  categorySpend.entries()
)
  .map(([category, data]) => ({
    category: `Category ${category}`,
    count: data.count,
    spend: Math.round(data.spend),
    percentage: Math.round((data.count / totalTransactions) * 100 * 10) / 10,
  }))
  .sort((a, b) => b.spend - a.spend);
```

---

## Interactive Visualizations

### 1. Tabbed Interface Structure

**Tab Organization:**

- **Purchase Patterns**: Radar charts, frequency distributions
- **Product Preferences**: Category treemaps, performance metrics
- **Channel Behavior**: Channel distribution, journey analysis
- **Engagement Analysis**: Engagement matrix, recommendations

**Navigation Features:**

- Persistent state across tabs
- Deep linking to specific tabs
- Filter state maintained across navigation
- Real-time data updates

### 2. Dynamic Filtering System

**Filter Types:**

- **Time-based**: Monthly, quarterly, annual, custom ranges
- **Segment-based**: Customer segment filtering
- **Product-based**: Category-specific analysis
- **Customer-specific**: Individual customer deep dives

**Real-time Updates:**

```typescript
useEffect(() => {
  const fetchData = async () => {
    // Determine effective time range
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
    setCustomerBehaviorData(behaviorData); // Context sharing
  };

  fetchData();
}, [timeRange, selectedSegment, selectedProduct, selectedCustomer, dateRange]);
```

### 3. Cross-Component Interactions

**Highlighting System:**

- Category selection in treemap affects other components
- Channel selection propagates across visualizations
- Customer selection updates all relevant charts
- Filter changes trigger coordinated updates

**State Synchronization:**

```typescript
const [highlightCategory, setHighlightCategory] = useState<
  string | undefined
>();
const [highlightChannel, setHighlightChannel] = useState<string | undefined>();

// Category selection handler
const handleCategoryClick = (category: string) => {
  setHighlightCategory(category);
  // Triggers updates in other components
};
```

---

## AI Integration & Insights

### 1. Behavioral Insights Generation

**Automated Insight Categories:**

- **Purchase Frequency Trends**: Analysis of buying patterns
- **Channel Preference Analysis**: Multi-channel behavior insights
- **Churn Risk Assessment**: Predictive risk analysis
- **Product Affinity Insights**: Category preference patterns

**Example Insight Generation:**

```typescript
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
    title: "Churn Risk Assessment",
    description:
      data.kpis.churnRiskPct > 20
        ? "Higher than expected churn risk detected"
        : "Churn risk is within acceptable range",
    impact: data.kpis.churnRiskPct > 20 ? "negative" : "positive",
  },
];
```

### 2. Component-Level Intelligence

**Interactive Analysis:**

```typescript
const kpiInsights = useComponentInsights({
  componentType: "KPI Tile",
  componentId: `kpi-${tile.label.toLowerCase().replace(/\s+/g, "-")}`,
  data: { value: tile.value, trend: tile.trend, rawValue: numericValue },
  generateInsights: (data) => {
    const insights = [];
    if (tile.label === "Churn Risk") {
      if (data.rawValue > 20) {
        insights.push("High churn risk detected - immediate action required");
        insights.push("Focus on at-risk customer retention programs");
      } else {
        insights.push("Low churn risk - customers are well-retained");
      }
    }
    // ... additional insight logic
    return insights;
  },
});
```

### 3. Behavioral Recommendations

**AI-Powered Suggestions:**

- **Increase Purchase Frequency**: Target customers with 30+ day intervals
- **Reduce Churn Risk**: Engage at-risk customers with retention programs
- **Cross-Channel Optimization**: Promote underutilized channels
- **Category Expansion**: Suggest new product categories to customers

**Recommendation Engine:**

```typescript
const recommendations = [
  {
    type: "Increase Purchase Frequency",
    description:
      "Target customers with 30+ day intervals with personalized offers",
    action: "Create Campaign",
    priority: "high",
    targetSegment: patterns.filter((p) => p.avg_purchase_interval > 30),
  },
  {
    type: "Reduce Churn Risk",
    description: "Engage at-risk customers with retention programs",
    action: "View At-Risk",
    priority: "critical",
    targetSegment: patterns.filter((p) => p.churn_risk === "high"),
  },
];
```

---

## Advanced Analytics

### 1. Customer Journey Analysis

**Multi-Channel Journey Mapping:**

- Channel transition probability matrices
- Customer path optimization
- Channel effectiveness analysis
- Journey completion rates

**Journey Metrics:**

```typescript
interface JourneyMetrics {
  averageJourneyLength: number; // Number of touchpoints
  channelSwitchRate: number; // Frequency of channel changes
  conversionByChannel: {
    // Channel-specific conversion rates
    [channel: string]: number;
  };
  journeyDropoffPoints: {
    // Where customers exit journey
    [step: number]: number;
  };
}
```

### 2. Predictive Modeling

**Behavioral Prediction Models:**

- Next purchase date prediction
- Churn probability scoring
- Lifetime value estimation
- Product recommendation scoring

**Prediction Algorithm Example:**

```typescript
function predictNextPurchase(pattern: BehaviorPattern): {
  predictedDate: string;
  confidence: number;
  daysFromNow: number;
} {
  // Simple linear prediction based on historical frequency
  const avgInterval = 365 / (pattern.frequency || 1);
  const daysSinceLastPurchase = pattern.recency;
  const expectedDays = Math.max(0, avgInterval - daysSinceLastPurchase);

  // Confidence based on pattern consistency
  const confidence = Math.min(1, pattern.frequency / 5); // Higher frequency = higher confidence

  const predictedDate = new Date(
    Date.now() + expectedDays * 24 * 60 * 60 * 1000
  );

  return {
    predictedDate: predictedDate.toISOString().split("T")[0],
    confidence: Math.round(confidence * 100) / 100,
    daysFromNow: Math.round(expectedDays),
  };
}
```

### 3. Cohort Analysis

**Time-Based Cohort Tracking:**

- Customer acquisition cohorts
- Retention rate analysis
- Revenue cohort performance
- Behavioral evolution tracking

**Cohort Metrics:**

```typescript
interface CohortAnalysis {
  cohortMonth: string; // Acquisition month
  customerCount: number; // Initial cohort size
  retentionRates: {
    // Monthly retention rates
    [month: number]: number;
  };
  revenuePerCohort: {
    // Monthly revenue per cohort
    [month: number]: number;
  };
  avgOrderValueTrend: {
    // AOV trend over time
    [month: number]: number;
  };
}
```

### 4. Statistical Analysis

**Advanced Statistical Measures:**

- Customer lifetime value (CLV) calculation
- Purchase probability modeling
- Seasonal trend analysis
- Customer similarity clustering

**CLV Calculation:**

```typescript
function calculateCustomerLifetimeValue(pattern: BehaviorPattern): number {
  // Historical CLV based on current patterns
  const monthlyPurchaseRate = pattern.frequency;
  const avgOrderValue = pattern.avg_order_value;
  const estimatedLifespanMonths = calculateLifespan(pattern);

  const clv = monthlyPurchaseRate * avgOrderValue * estimatedLifespanMonths;
  return Math.round(clv * 100) / 100;
}

function calculateLifespan(pattern: BehaviorPattern): number {
  // Simple lifespan estimation based on engagement and churn risk
  const baseLifespan = 24; // 24 months baseline

  // Adjust based on churn risk
  const churnMultiplier =
    pattern.churn_risk === "low"
      ? 1.5
      : pattern.churn_risk === "medium"
      ? 1.0
      : 0.5;

  // Adjust based on loyalty
  const loyaltyMultiplier = Math.min(2.0, pattern.loyalty / 50);

  return baseLifespan * churnMultiplier * loyaltyMultiplier;
}
```

---

## Performance & Optimization

### 1. Database Query Optimization

**Efficient Data Retrieval:**

- Indexed customer and transaction tables
- Optimized JOIN operations
- Limited result sets to prevent memory issues
- Proper date range filtering

**Query Performance:**

```sql
-- Optimized transaction query with proper indexing
SELECT
  [Customer Key] as customer_id,
  [Txn Date] as transaction_date,
  [Net Sales Amount] as sales_amount,
  [Net Sales Quantity] as quantity,
  [Item Key] as item_id,
  [Line Type] as sales_channel,
  [Item Category Hrchy Key] as product_category
FROM dbo_F_Sales_Transaction
WHERE [Txn Date] BETWEEN ? AND ?
  AND [Deleted Flag] = 0
  AND [Excluded Flag] = 0
  AND [Customer Key] > 0
  AND [Net Sales Amount] IS NOT NULL
  AND [Net Sales Quantity] IS NOT NULL
LIMIT 10000
```

### 2. Frontend Performance

**React Optimization Strategies:**

- Component memoization with `useMemo` and `useCallback`
- Lazy loading for heavy visualizations
- Virtual scrolling for large datasets
- Efficient re-rendering patterns

**Memory Management:**

```typescript
// Memoized calculations for expensive operations
const radarData = useMemo(() => {
  if (!patterns.length) return [];

  const avgMetrics = patterns.reduce((acc, pattern) => {
    acc.frequency += pattern.frequency;
    acc.recency += pattern.recency;
    // ... other metrics
    return acc;
  }, initialMetrics);

  return calculateRadarData(avgMetrics, patterns.length);
}, [patterns]);
```

### 3. Real-time Updates

**Efficient State Management:**

- Context-based data sharing
- Selective component updates
- Optimistic UI updates
- Debounced filter applications

---

## Security & Data Privacy

### 1. Data Protection

**Security Measures:**

- Server-side data processing
- No sensitive customer data in client state
- Secure database connections
- Data anonymization where appropriate

### 2. Access Control

**Permission-Based Access:**

- Component-level access control
- Data filtering at API layer
- User session validation
- Audit trail logging

---

## Future Enhancements

### 1. Machine Learning Integration

- Advanced clustering algorithms for customer segmentation
- Predictive models for purchase behavior
- Recommendation engines for product suggestions
- Anomaly detection for unusual behavior patterns

### 2. Real-time Analytics

- Streaming data processing
- Live dashboard updates
- Real-time alerts and notifications
- Event-driven architecture

### 3. Advanced Visualizations

- 3D customer journey maps
- Interactive timeline analysis
- Geographic behavior mapping
- Network analysis for customer relationships

### 4. Export & Integration

- PDF report generation
- Excel data export capabilities
- API integrations with CRM systems
- Automated reporting schedules

---

This comprehensive documentation covers the entire Customer Behavior Analytics system, providing detailed insights into architecture, implementation, and functionality. The system represents a sophisticated approach to understanding customer behavior through advanced analytics, interactive visualizations, and AI-powered insights.
