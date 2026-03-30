"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ChartWrapper } from "./styled";
import { COLOR } from "@/styles";

const PIE_COLORS = [COLOR.PRIMARY, "#2E2E2E", "#95CC00", "#D4E8C1", "#A8E10C"];

export const PiesChart = ({
  pieData,
}: {
  pieData: { name: string; value: number }[];
}) => {
  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1500}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};
