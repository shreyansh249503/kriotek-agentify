"use client";

import React from "react";
import {
  StatsCardContainer,
  IconWrapper,
  StatsValue,
  StatsLabel,
  ChangeIndicator,
} from "./styled";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  change,
}) => {
  return (
    <StatsCardContainer>
      <IconWrapper>{icon}</IconWrapper>
      <StatsValue>{value}</StatsValue>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <StatsLabel>{label}</StatsLabel>
        {change && (
          <ChangeIndicator $positive={change.positive}>
            {change.positive ? "↑" : "↓"} {change.value}
          </ChangeIndicator>
        )}
      </div>
    </StatsCardContainer>
  );
};
