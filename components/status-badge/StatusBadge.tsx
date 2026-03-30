"use client";

import React from "react";
import { Badge } from "./styled";

interface StatusBadgeProps {
  status: "active" | "inactive";
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
}) => {
  return <Badge $status={status}>{children}</Badge>;
};
