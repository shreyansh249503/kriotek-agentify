"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBots } from "@/hooks/useBot";
import { AgentCreationFormData } from "./types";
import { StepHearAboutUs } from "./steps/StepHearAboutUs";
import { StepCompanySize } from "./steps/StepCompanySize";
import { StepTrainingSource } from "./steps/StepTrainingSource";
import { StepFuturePlaceholder } from "./steps/StepFuturePlaceholder";
import {
  PageContainer,
  LeftHeroSection,
  RightContentSection,
  HeaderRow,
  BrandContainer,
  StepIndicator,
  StepDot,
  MainContentArea,
  ActionButtonsRow,
  BackButton,
  ContinueButton,
  FooterRow,
  FooterCopyright,
  FooterLinks,
  FooterLink,
  BrandLogoImage,
} from "./styled";
import Logo from "@/assets/images/Agentify logo black.png"

const TOTAL_DOTS = 6;

export const AgentCreation: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: bots, isLoading: botsLoading } = useBots();

  const isFirstTimeExplicit = searchParams.get("firstTime") === "true";
  const isReturningExplicit = searchParams.get("returning") === "true";

  const isFirstTime = useMemo(() => {
    if (isFirstTimeExplicit) return true;
    if (isReturningExplicit) return false;
    if (!botsLoading && bots) {
      return bots.length === 0;
    }
    return true; 
  }, [bots, botsLoading, isFirstTimeExplicit, isReturningExplicit]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [formData, setFormData] = useState<AgentCreationFormData>({
    hearAboutUs: "",
    companySize: "",
    trainingMethod: "website",
    websiteUrl: "",
    files: [],
    textSnippet: "",
    qnaList: [],
    agentName: "",
    agentTone: "Friendly and Professional",
    primaryColor: "#A8E10C",
    customGreeting: "Hi! How can I assist you today?",
  });

  const updateFormData = (updates: Partial<AgentCreationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const steps = useMemo(() => {
    if (isFirstTime) {
      return [
        {
          id: "hear-about-us",
          title: "How did you hear about us?",
          component: (
            <StepHearAboutUs
              formData={formData}
              updateFormData={updateFormData}
            />
          ),
          isValid: () => !!formData.hearAboutUs,
        },
        {
          id: "company-size",
          title: "What's your company size?",
          component: (
            <StepCompanySize
              formData={formData}
              updateFormData={updateFormData}
            />
          ),
          isValid: () => !!formData.companySize,
        },
        {
          id: "training-source",
          title: "How would you like to train AI Agent?",
          component: (
            <StepTrainingSource
              formData={formData}
              updateFormData={updateFormData}
            />
          ),
          isValid: () =>
            formData.trainingMethod === "website"
              ? !!formData.websiteUrl.trim()
              : formData.trainingMethod === "files"
              ? formData.files.length > 0
              : formData.trainingMethod === "text"
              ? !!formData.textSnippet.trim()
              : formData.qnaList.length > 0,
        },
        {
          id: "agent-persona",
          title: "Configure Agent Details",
          component: (
            <StepFuturePlaceholder
              stepNumber={4}
              title="Configure Agent Details"
              formData={formData}
              updateFormData={updateFormData}
            />
          ),
          isValid: () => true,
        },
        {
          id: "widget-theme",
          title: "Customize Widget Theme",
          component: (
            <StepFuturePlaceholder
              stepNumber={5}
              title="Customize Widget Theme"
              formData={formData}
              updateFormData={updateFormData}
            />
          ),
          isValid: () => true,
        },
        {
          id: "review-launch",
          title: "Review & Launch Agent",
          component: (
            <StepFuturePlaceholder
              stepNumber={6}
              title="Review & Launch Agent"
              formData={formData}
              updateFormData={updateFormData}
            />
          ),
          isValid: () => true,
        },
      ];
    } else {
      return [
        {
          id: "training-source",
          title: "How would you like to train AI Agent?",
          component: (
            <StepTrainingSource
              formData={formData}
              updateFormData={updateFormData}
            />
          ),
          isValid: () =>
            formData.trainingMethod === "website"
              ? !!formData.websiteUrl.trim()
              : formData.trainingMethod === "files"
              ? formData.files.length > 0
              : formData.trainingMethod === "text"
              ? !!formData.textSnippet.trim()
              : formData.qnaList.length > 0,
        },
        {
          id: "agent-persona",
          title: "Configure Agent Details",
          component: (
            <StepFuturePlaceholder
              stepNumber={2}
              title="Configure Agent Details"
              formData={formData}
              updateFormData={updateFormData}
            />
          ),
          isValid: () => true,
        },
        {
          id: "widget-theme",
          title: "Customize Widget Theme",
          component: (
            <StepFuturePlaceholder
              stepNumber={3}
              title="Customize Widget Theme"
              formData={formData}
              updateFormData={updateFormData}
            />
          ),
          isValid: () => true,
        },
        {
          id: "review-launch",
          title: "Review & Launch Agent",
          component: (
            <StepFuturePlaceholder
              stepNumber={4}
              title="Review & Launch Agent"
              formData={formData}
              updateFormData={updateFormData}
            />
          ),
          isValid: () => true,
        },
      ];
    }
  }, [isFirstTime, formData]);

  const activeStep = steps[currentStepIndex] || steps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isCurrentStepValid = activeStep?.isValid ? activeStep.isValid() : true;

  const activeDotCount = useMemo(() => {
    if (isFirstTime) {
      return currentStepIndex + 1;
    } else {
      const progress = ((currentStepIndex + 1) / steps.length) * TOTAL_DOTS;
      return Math.max(1, Math.min(TOTAL_DOTS, Math.round(progress)));
    }
  }, [isFirstTime, currentStepIndex, steps.length]);

  const handleNext = () => {
    if (isLastStep) {
      router.push("/admin/bots");
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      router.push("/admin");
    } else {
      setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <PageContainer data-testid="agent-creation-page">
      <LeftHeroSection data-testid="left-hero-section" />

      <RightContentSection data-testid="right-content-section">
        <HeaderRow>
          <BrandContainer href="/admin" data-testid="brand-logo-link">
            <BrandLogoImage
              src={Logo}
              alt="Agentify Logo"
              width={600}
              height={600}
            />
          </BrandContainer>

          <StepIndicator data-testid="step-indicator">
            {Array.from({ length: TOTAL_DOTS }).map((_, idx) => (
              <StepDot
                key={idx}
                $active={idx < activeDotCount}
                data-testid={`step-dot-${idx + 1}`}
                data-active={idx < activeDotCount}
              />
            ))}
          </StepIndicator>
        </HeaderRow>

        <MainContentArea>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep?.id || currentStepIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ width: "100%" }}
            >
              {activeStep?.component}
            </motion.div>
          </AnimatePresence>

          <ActionButtonsRow
            $hasBack={!isFirstStep || (!isFirstTime && isFirstStep)}
          >
            {(!isFirstStep || !isFirstTime) && (
              <BackButton
                type="button"
                onClick={handleBack}
                data-testid="wizard-back-btn"
              >
                Back
              </BackButton>
            )}

            <ContinueButton
              type="button"
              $fullWidth={isFirstStep && isFirstTime}
              onClick={handleNext}
              disabled={!isCurrentStepValid}
              data-testid="wizard-continue-btn"
            >
              {isLastStep ? "Create Agent" : "Continue"}
            </ContinueButton>
          </ActionButtonsRow>
        </MainContentArea>

        <FooterRow>
          <FooterCopyright>© 2026 Agentify</FooterCopyright>
          <FooterLinks>
            <FooterLink href="/terms" target="_blank">
              Terms
            </FooterLink>
            <FooterLink href="/privacy" target="_blank">
              Privacy
            </FooterLink>
          </FooterLinks>
        </FooterRow>
      </RightContentSection>
    </PageContainer>
  );
};

export default AgentCreation;
