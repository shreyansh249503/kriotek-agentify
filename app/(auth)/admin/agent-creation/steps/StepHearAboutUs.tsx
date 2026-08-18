"use client";

import React from "react";
import { StepProps } from "../types";
import { StepTitle, PillsContainer, OptionPill } from "../styled";

export const HEAR_ABOUT_US_OPTIONS = [
  "Google Search",
  "ChatGPT / Claude / other AI",
  "Friend or colleague",
  "Another website using Agentify",
  "LinkedIn",
  "X",
  "YouTube",
  "Other",
];

export const StepHearAboutUs: React.FC<StepProps> = ({
  formData,
  updateFormData,
}) => {
  const handleSelect = (option: string) => {
    updateFormData({ hearAboutUs: option });
  };

  return (
    <div data-testid="step-hear-about-us">
      <StepTitle>How did you hear about us?</StepTitle>
      <PillsContainer data-testid="hear-about-us-options">
        {HEAR_ABOUT_US_OPTIONS.map((option) => {
          const isSelected = formData.hearAboutUs === option;
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
