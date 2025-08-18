"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryAffinity } from "@/types/customer-behavior";
import { ResponsiveContainer, Treemap, Cell } from "recharts";

interface CategoryTreemapProps {
  categories: CategoryAffinity[];
  highlightCategory?: string;
}

export function CategoryTreemap({
  categories,
  highlightCategory,
}: CategoryTreemapProps) {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
  ];

  // Validate and filter categories data
  const validCategories =
    categories?.filter(
      (category) =>
        category &&
        category.category &&
        typeof category.spend === "number" &&
        category.spend > 0
    ) || [];

  const treemapData = validCategories.map((category, index) => ({
    name: category.category,
    size: category.spend,
    count: category.count,
    percentage: category.percentage,
    color: colors[index % colors.length],
  }));

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload } = props;

    // Guard against undefined payload
    if (!payload || !payload.color) {
      return null;
    }

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: payload.color,
            stroke: "hsl(var(--border))",
            strokeWidth: 2,
            strokeOpacity: 0.5,
            fillOpacity: highlightCategory === payload.name ? 0.9 : 0.7,
          }}
        />
        {width > 60 && height > 30 && payload.name && (
          <text
            x={x + width / 2}
            y={y + height / 2 - 7}
            textAnchor="middle"
            fill="hsl(var(--background))"
            fontSize={width > 100 ? 14 : 12}
            fontWeight="bold"
          >
            {payload.name}
          </text>
        )}
        {width > 80 && height > 50 && payload.size && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="hsl(var(--background))"
            fontSize={10}
            opacity={0.8}
          >
            ${(payload.size / 1000).toFixed(0)}k
          </text>
        )}
        {width > 100 && height > 70 && payload.percentage && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 25}
            textAnchor="middle"
            fill="hsl(var(--background))"
            fontSize={9}
            opacity={0.7}
          >
            {payload.percentage}%
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
    <Card>
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
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="hsl(var(--border))"
              content={<CustomizedContent />}
            />
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {validCategories.slice(0, 8).map((category, index) => (
            <div key={category.category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-muted-foreground">{category.category}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
