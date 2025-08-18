"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChannelUsage } from "@/types/customer-behavior";
import { BarChart3 } from "lucide-react";

interface ChannelJourneySankeyProps {
  channels: ChannelUsage[];
}

export function ChannelJourneySankey({ channels }: ChannelJourneySankeyProps) {
  // For now, this is a placeholder component
  // A full Sankey diagram would require additional libraries like react-sankey or d3-sankey

  const topChannels = channels
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Journey Analysis</CardTitle>
        <CardDescription>
          Cross-channel customer behavior patterns and transitions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Sankey Diagram</p>
            <p className="text-sm mb-4">
              Interactive channel flow visualization would be implemented here
            </p>

            {/* Show simplified channel flow for now */}
            <div className="bg-muted/20 rounded-lg p-4 max-w-md">
              <p className="text-sm font-medium mb-3">Top Channel Flow</p>
              <div className="space-y-2">
                {topChannels.map((channel, index) => (
                  <div
                    key={channel.channel}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: `hsl(${
                            (index * 360) / topChannels.length
                          }, 70%, 50%)`,
                        }}
                      />
                      <span className="text-sm">{channel.channel}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {channel.percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs mt-4 opacity-60">
              Full implementation would show customer transitions between
              channels,
              <br />
              journey paths, and conversion rates
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
