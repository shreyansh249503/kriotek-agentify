"use client";

import React from "react";
import { StepProps } from "../types";
import { StepTitle, PillsContainer, OptionPill } from "../styled";

export const COMPANY_SIZE_OPTIONS = [
  "Startup (1-9)",
  "Small business (10-49)",
  "Mid-market (50-499)",
  "Enterprise (500+)",
];

export const StepCompanySize: React.FC<StepProps> = ({
  formData,
  updateFormData,
}) => {
  const handleSelect = (option: string) => {
    updateFormData({ companySize: option });
  };

  return (
    <div data-testid="step-company-size">
      <StepTitle>What&apos;s your company size?</StepTitle>
      <PillsContainer data-testid="company-size-options">
        {COMPANY_SIZE_OPTIONS.map((option) => {
          const isSelected = formData.companySize === option;
          return (
            <OptionPill
              key={option}
              type="button"
              $isSelected={isSelected}
              onClick={() => handleSelect(option)}
              data-testid={`option-${option.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`}
            >
              {option}
            </OptionPill>
          );
        })}
      </PillsContainer>
    </div>
  );
};
