"use client";

import React from "react";
import {
  EmptyStateContainer,
  EmptyIcon,
  EmptyTitle,
  EmptyDescription,
  EmptyActionButton,
} from "./styled";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <EmptyStateContainer>
      <EmptyIcon>{icon}</EmptyIcon>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
      {actionLabel && onAction && (
        <EmptyActionButton onClick={onAction}>{actionLabel}</EmptyActionButton>
      )}
    </EmptyStateContainer>
  );
};
