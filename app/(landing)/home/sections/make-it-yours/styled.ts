"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Image from "next/image";
import styled from "styled-components";

export const MakeItYoursMainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0px;
  gap: 60px;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    padding: 60px 0px;
    gap: 40px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 40px 0px;
    gap: 30px;
  }
`;

export const MakeItYoursSectionHeader = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 90%;
    text-align: center;
  }
`;

export const MakeItYoursTitleBtn = styled.div`
  width: fit-content;
  padding: 10px 18px;
  background-color: ${COLOR.WHITE};
  border-radius: 24px;
  border: 1px solid ${COLOR.BORDER};
  font-size: 15px;
  font-weight: 500;
  color: ${COLOR.PRIMARY_HOVER};
`;

export const MakesItYoursHeading = styled.h2`
  font-size: 38px;
  font-weight: 600;
  color: ${COLOR.DARK};
  line-height: 1.2;
  text-align: center;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 32px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 26px;
  }
`;

export const MakeItYoursContainer = styled.div`
  width: 85%;
  max-width: 1400px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 90%;
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 95%;
    gap: 20px;
  }
`;

export const MakeItYoursCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex: 1;
  min-width: 0;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 100%;
    max-width: 320px;
  }
`;

export const MakeItYoursCardImage = styled(Image)`
  width: 100%;
  height: 150px;
  max-width: 220px;
  object-fit: contain;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    height: 180px;
    max-width: 280px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    height: 150px;
    max-width: 220px;
  }
`;

export const MakeItYoursCardText = styled.p`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: ${COLOR.DARK};
  text-align: center;
  white-space: nowrap;

  svg {
    color: ${COLOR.DARK};
    font-size: 14px;
    flex-shrink: 0;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    font-size: 17px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 15px;
  }
`;

export const MakeItYoursHR = styled.div`
  width: 2px;
  height: 120px;
  background-color: #e2e0e0;
  flex-shrink: 0;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 100px;
    height: 2px;
  }
`;
