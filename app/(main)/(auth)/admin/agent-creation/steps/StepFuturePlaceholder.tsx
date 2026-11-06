"use client";

import React from "react";
import { StepProps } from "../types";
import {
  StepTitle,
  SectionBlock,
  SectionLabel,
  UrlInputGroup,
  UrlInputField,
} from "../styled";

interface FutureStepPlaceholderProps extends StepProps {
  stepNumber: number;
  title: string;
}

export const StepFuturePlaceholder: React.FC<FutureStepPlaceholderProps> = ({
  formData,
  updateFormData,
  stepNumber,
  title,
}) => {
  return (
    <div data-testid={`step-future-${stepNumber}`}>
      <StepTitle>{title}</StepTitle>
      <SectionBlock>
        <SectionLabel>Agent Name</SectionLabel>
        <UrlInputGroup>
          <UrlInputField
            type="text"
            placeholder="e.g. Sales Assistant, Support Bot"
            value={formData.agentName || ""}
            onChange={(e) => updateFormData({ agentName: e.target.value })}
            data-testid="agent-name-input"
          />
        </UrlInputGroup>
      </SectionBlock>
    </div>
  );
};
