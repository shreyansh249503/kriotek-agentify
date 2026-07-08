"use client";

import { COLOR } from "@/styles";
import Image from "next/image";
import styled from "styled-components";

export const RealTimeInsightsMainConatiner = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 130px 0px;
`;

export const RealTimeInsightsSectionHeader = styled.div`
  width: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
`;

export const RealTimeInsightsPrimarySection = styled.div`
  width: 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 38px;
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
`;

export const RealTimeInsightsHeading = styled.h2`
  font-size: 38px;
  font-weight: 600;
  color: ${COLOR.DARK};
  line-height: 1.2;
`;

export const RealTimeInsightsDescription = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  max-width: 85%;
`;

export const RealTimeInsightsSecondarySection = styled.div`
  width: 55%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;

export const RealTimeInsightsDashboardImage = styled(Image)`
  width: 90%;
  height: auto;
  object-fit: cover;
  border: 1px solid #eaeaea;
  border-radius: 12px;
`;

export const RealTimeInsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const RealTimeInsightsListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16.5px;
  color: ${COLOR.TEXT_SECONDARY};
  font-weight: 500;

  svg {
    color: ${COLOR.PRIMARY_HOVER};
    flex-shrink: 0;
  }
`;

export const FlowtingImage = styled(Image)`
  position: absolute;
  bottom: 30px;
  right: 200px;
  width: auto;
  height: auto;
  object-fit: contain;
`;
