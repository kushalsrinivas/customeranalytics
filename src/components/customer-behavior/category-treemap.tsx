"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryAffinity } from "@/types/customer-behavior";
import { ResponsiveContainer, Treemap } from "recharts";
import { useComponentInsights } from "@/hooks/use-component-insights";
import { useDashboard } from "@/contexts/dashboard-context";

interface CategoryTreemapProps {
  categories: CategoryAffinity[];
  highlightCategory?: string;
}

export function CategoryTreemap({
  categories,
  highlightCategory,
}: CategoryTreemapProps) {
  const {} = useDashboard();

  const chartInsights = useComponentInsights({
    componentType: "Treemap Chart",
    componentId: "category-treemap",
    data: {
      categories: categories,
      totalCategories: categories?.length || 0,
      topCategory: categories?.[0]?.category,
      topCategorySpend: categories?.[0]?.spend,
    },
    generateInsights: (data) => {
      const insights = [];
      if (data.totalCategories > 0) {
        insights.push(`Analyzing ${data.totalCategories} product categories`);
        if (data.topCategory) {
          insights.push(
            `Top category: ${data.topCategory} ($${(
              data.topCategorySpend / 1000
            ).toFixed(0)}k spend)`
          );
        }

        const totalSpend =
          categories?.reduce((sum, cat) => sum + (cat.spend || 0), 0) || 0;
        const top3Spend =
          categories
            ?.slice(0, 3)
            .reduce((sum, cat) => sum + (cat.spend || 0), 0) || 0;
        const concentration =
          totalSpend > 0 ? (top3Spend / totalSpend) * 100 : 0;

        if (concentration > 70) {
          insights.push(
            "High category concentration - consider diversifying product mix"
          );
        } else if (concentration < 40) {
          insights.push("Well-diversified category mix across customer base");
        } else {
          insights.push("Moderate category concentration");
        }
      } else {
        insights.push("No category data available");
      }
      return insights;
    },
    metadata: {
      title: "Category Preferences",
      description: "Product category distribution by spend volume",
      value: categories?.length ? `${categories.length} categories` : "No data",
    },
  });

  const colors = [
    "#3B82F6", // Bright Blue
    "#EF4444", // Bright Red
    "#10B981", // Emerald Green
    "#F59E0B", // Amber
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#F97316", // Orange
    "#6366F1", // Indigo
    "#14B8A6", // Teal
    "#F43F5E", // Rose
    "#8B5A2B", // Brown
    "#6B7280", // Gray
    "#DC2626", // Dark Red
    "#059669", // Dark Green
  ];

  // Validate and filter categories data
  const validCategories =
    categories?.filter(
      (category) =>
        category &&
        category.category &&
        typeof category.spend === "number" &&
        category.spend > 0 &&
        typeof category.count === "number" &&
        category.count > 0
    ) || [];

  const treemapData = validCategories.map((category, index) => ({
    name: category.category,
    value: Math.max(category.spend, 1), // Use 'value' instead of 'size' for Recharts
    count: category.count,
    percentage: category.percentage || 0,
    fill: colors[index % colors.length],
  }));

  // Custom content component for treemap cells
  const CustomContent = (props: any) => {
    const { x, y, width, height, name, value, fill } = props;

    // Only render if the cell is large enough
    if (width < 40 || height < 30) {
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={fill}
            stroke="#ffffff"
            strokeWidth={2}
            strokeOpacity={0.8}
            fillOpacity={highlightCategory === name ? 1.0 : 0.85}
          />
        </g>
      );
    }

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          stroke="#ffffff"
          strokeWidth={3}
          strokeOpacity={0.9}
          fillOpacity={highlightCategory === name ? 1.0 : 0.85}
          filter={
            highlightCategory === name
              ? "drop-shadow(0 0 8px rgba(0,0,0,0.3))"
              : "none"
          }
        />
        {width > 60 && height > 40 && (
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill="white"
            fontSize={width > 120 ? 15 : 13}
            fontWeight="bold"
            style={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.5))",
            }}
          >
            {name}
          </text>
        )}
        {width > 80 && height > 60 && value && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 8}
            textAnchor="middle"
            fill="white"
            fontSize={12}
            opacity={0.95}
            style={{
              textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
              fontWeight: "600",
            }}
          >
            ${(value / 1000).toFixed(0)}k
          </text>
        )}
        {width > 100 && height > 80 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 24}
            textAnchor="middle"
            fill="white"
            fontSize={11}
            opacity={0.9}
            style={{
              textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
              fontWeight: "500",
            }}
          >
            {validCategories
              .find((c) => c.category === name)
              ?.percentage.toFixed(1)}
            %
          </text>
        )}
      </g>
    );
  };

  // Show empty state if no valid data
  if (treemapData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Preferences</CardTitle>
          <CardDescription>
            Product category distribution by spend volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">No category data available</p>
              <p className="text-sm">
                Data will appear here once transactions are loaded
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      {...chartInsights.getClickProps()}
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      <CardHeader>
        <CardTitle>Category Preferences</CardTitle>
        <CardDescription>
          Product category distribution by spend volume
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="value"
              aspectRatio={4 / 3}
              stroke="hsl(var(--border))"
              content={<CustomContent />}
            />
          </ResponsiveContainer>
        </div>

        {/* Category Legend */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {validCategories.slice(0, 8).map((category, index) => (
            <div key={category.category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-xs truncate">
                  {category.category}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${(category.spend / 1000).toFixed(0)}k •{" "}
                  {category.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold">{validCategories.length}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              $
              {(
                validCategories.reduce((sum, cat) => sum + cat.spend, 0) / 1000
              ).toFixed(0)}
              k
            </div>
            <div className="text-xs text-muted-foreground">Total Spend</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              {validCategories.reduce((sum, cat) => sum + cat.count, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Transactions</div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            💡 <strong>Insight:</strong> This treemap shows category
            distribution by spend volume. Larger rectangles represent higher
            spending categories. Click on categories in the performance list to
            highlight them in the treemap.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
