"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ChartCard,
  ChartHeader,
  ChartTitle,
  TimeframeSelect,
  LegendContainer,
  LegendItem,
  LegendBadge,
  ChartWrapper,
} from "./styled";
import { ChartTooltip } from "../chart-tool-tip";

export interface BotBarData {
  name: string;
  Interactions: number;
  ContactsCollected: number;
}

const sampleData: BotBarData[] = [
  { name: "Agentify", Interactions: 36, ContactsCollected: 24 },
  { name: "Krio-Bot", Interactions: 21, ContactsCollected: 15 },
  { name: "Planty", Interactions: 28, ContactsCollected: 8 },
];

export const BarsChart = ({ botBarData }: { botBarData?: BotBarData[] }) => {
  const [timeframe, setTimeframe] = useState("Monthly");
  const chartData =
    botBarData && botBarData.length > 0 ? botBarData : sampleData;

  return (
    <ChartCard data-testid="leads-over-time-card">
      <ChartHeader>
        <div>
          <ChartTitle>Leads Over Time</ChartTitle>
          <LegendContainer>
            <LegendItem>
              <LegendBadge $color="#A3E635" />
              <span>Conversation</span>
            </LegendItem>
            <LegendItem>
              <LegendBadge $color="#27272A" />
              <span>Leads</span>
            </LegendItem>
          </LegendContainer>
        </div>

        <TimeframeSelect
          data-testid="timeframe-select"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="Monthly">Monthly</option>
          <option value="Weekly">Weekly</option>
          <option value="Daily">Daily</option>
        </TimeframeSelect>
      </ChartHeader>

      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={8}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#E2F2D2"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{
                fontSize: 12,
                fill: "#4B5563",
                fontWeight: 500,
              }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: 12,
                fill: "#9CA3AF",
                fontWeight: 500,
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                value < 10 && value > 0 ? `0${value}` : `${value}`
              }
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(163, 230, 53, 0.05)" }}
            />
            <Bar
              dataKey="Interactions"
              name="Conversation"
              fill="#A3E635"
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
              maxBarSize={48}
            />
            <Bar
              dataKey="ContactsCollected"
              name="Leads"
              fill="#27272A"
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartCard>
  );
};
