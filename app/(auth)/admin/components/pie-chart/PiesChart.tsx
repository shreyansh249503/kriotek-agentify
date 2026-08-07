"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  ChartCard,
  ChartHeader,
  ChartTitle,
  ChartBody,
  DonutWrapper,
  LegendList,
  LegendRow,
  LegendLeft,
  LegendBadgeCircle,
  LegendName,
  LegendValue,
} from "./styled";

export interface PieDataItem {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

const DEFAULT_COLOR_PALETTE = ["#90D7FF", "#3B9EEA", "#768CF3", "#AC72EE"];

const DEFAULT_SOURCE_DATA: PieDataItem[] = [
  { name: "Website", value: 60, color: "#90D7FF", percentage: 60 },
  { name: "Shopify", value: 25, color: "#3B9EEA", percentage: 25 },
  { name: "WhatsApp", value: 10, color: "#768CF3", percentage: 10 },
  { name: "Others", value: 5, color: "#AC72EE", percentage: 5 },
];

export const PiesChart = ({
  pieData,
}: {
  pieData?: { name: string; value: number }[];
}) => {
  const formattedData: PieDataItem[] = React.useMemo(() => {
    if (!pieData || pieData.length === 0) {
      return DEFAULT_SOURCE_DATA;
    }

    const total = pieData.reduce((sum, item) => sum + item.value, 0);

    return pieData.map((item, index) => {
      const color = DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length];
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
      return {
        name: item.name,
        value: item.value,
        percentage,
        color,
      };
    });
  }, [pieData]);

  const totalValue = formattedData.reduce((sum, d) => sum + d.value, 0);

  return (
    <ChartCard>
      <ChartHeader>
        <ChartTitle>Leads by Source</ChartTitle>
      </ChartHeader>

      <ChartBody>
        <DonutWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={0}
                dataKey="value"
                animationDuration={1500}
                stroke="none"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | string | undefined, name: string | undefined) => [
                  `${value ?? 0} (${totalValue > 0 ? Math.round(((Number(value) || 0) / totalValue) * 100) : 0}%)`,
                  name ?? "",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </DonutWrapper>

        <LegendList>
          {formattedData.map((item) => {
            const pct =
              item.percentage !== undefined
                ? item.percentage
                : totalValue > 0
                  ? Math.round((item.value / totalValue) * 100)
                  : 0;

            return (
              <LegendRow key={item.name}>
                <LegendLeft>
                  <LegendBadgeCircle $color={item.color || "#3B9EEA"} />
                  <LegendName>{item.name}</LegendName>
                </LegendLeft>
                <LegendValue>{pct}%</LegendValue>
              </LegendRow>
            );
          })}
        </LegendList>
      </ChartBody>
    </ChartCard>
  );
};
