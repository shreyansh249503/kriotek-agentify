"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ChartWrapper } from "./styled";
import { COLOR } from "@/styles";
import { ChartTooltip } from "../chart-tool-tip";

export interface BotBarData {
  name: string;
  Interactions: number;
  ContactsCollected: number;
}

export const BarsChart = ({ botBarData }: { botBarData: BotBarData[] }) => {
  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={botBarData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barGap={8}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={`${COLOR.BORDER}66`}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{
              fontSize: 10,
              fill: COLOR.TEXT_SECONDARY,
              fontWeight: 500,
            }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            allowDecimals={false}
            tick={{
              fontSize: 11,
              fill: COLOR.TEXT_SECONDARY,
              fontWeight: 500,
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.02)" }}
          />
          <Bar
            dataKey="Interactions"
            fill={COLOR.PRIMARY}
            radius={[6, 6, 0, 0]}
            animationDuration={1500}
          />
          <Bar
            dataKey="ContactsCollected"
            fill={COLOR.DARK}
            radius={[6, 6, 0, 0]}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};
