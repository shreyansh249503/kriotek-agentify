"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Image from "next/image";
import styled from "styled-components";

export const RealTimeInsightsMainConatiner = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 110px 0px;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    padding: 60px 0px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 40px 0px;
  }
`;

export const RealTimeInsightsSectionHeader = styled.div`
  width: 80%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 90%;
    flex-direction: column-reverse;
    gap: 40px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 95%;
    gap: 30px;
  }
`;

export const RealTimeInsightsPrimarySection = styled.div`
  width: 45%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 28px;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 100%;
    gap: 20px;
  }
`;

export const RealTimeInsightsTitleBtn = styled.div`
  width: fit-content;
  padding: 10px 18px;
  background-color: ${COLOR.WHITE};
  border-radius: 24px;
  border: 1px solid ${COLOR.BORDER};
  font-size: 15px;
  font-weight: 500;
  color: ${COLOR.PRIMARY_HOVER};

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 13px;
    padding: 8px 14px;
  }
`;

export const RealTimeInsightsHeading = styled.h2`
  font-size: 38px;
  font-weight: 600;
  color: ${COLOR.DARK};
  line-height: 1.2;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    font-size: 32px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 25px;
  }
`;

export const RealTimeInsightsDescription = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  max-width: 100%;
  line-height: 1.5;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 14px;
  }
`;

export const RealTimeInsightsSecondarySection = styled.div`
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 100%;
  }
`;

export const RealTimeInsightsDashboardImage = styled(Image)`
  width: 100%;
  max-width: 560px;
  height: auto;
  object-fit: contain;
  border: 1px solid #eaeaea;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    border-radius: 12px;
  }
`;

export const RealTimeInsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`;

export const RealTimeInsightsListItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  font-weight: 500;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 14px;
  }

  svg {
    color: ${COLOR.PRIMARY_HOVER};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

export const FlowtingImage = styled(Image)`
  position: absolute;
  bottom: 20px;
  right: 5%;
  width: auto;
  max-width: 280px;
  height: auto;
  object-fit: contain;
  pointer-events: none;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    display: none;
  }
`;
