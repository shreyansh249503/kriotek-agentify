import styled from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

export const BenefitItem = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
`;

export const BenefitNumber = styled.span`
  font-size: 64px;
  font-weight: 800;
  color: ${COLOR.BORDER}; // Subtle number
  line-height: 1;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 48px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 40px;
  }
`;

export const BenefitContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const BenefitTitle = styled.h4`
  font-size: 24px;
  font-weight: 700;
  color: ${COLOR.DARK};
`;

export const BenefitDescription = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
  margin: 0;
`;