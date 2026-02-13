"use client";

import React from "react";
import { Badge } from "./styled";

interface StatusBadgeProps {
  status: "active" | "inactive";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return <Badge $status={status}>{status}</Badge>;
};
