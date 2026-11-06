"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Image from "next/image";
import styled from "styled-components";

export const BotOverviewMainContainer = styled.div`
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

export const BotOverviewContainer = styled.div`
  width: 85%;
  max-width: 1350px;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 30px;

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

export const BotOverviewCardContainer = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 30px;
  background-color: #f5f8f8;
  padding: 30px;
  border-radius: 24px;
  border: 1px solid #e7e8e8;
  box-sizing: border-box;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 100%;
    max-width: 600px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 20px 16px;
    gap: 20px;
    border-radius: 16px;
  }
`;

export const BotOverviewCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 16px;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    gap: 12px;
  }
`;

export const BotOverviewTitleBtn = styled.div`
  width: fit-content;
  padding: 8px 16px;
  background-color: ${COLOR.WHITE};
  border-radius: 24px;
  border: 1px solid ${COLOR.BORDER};
  font-size: 14px;
  font-weight: 500;
  color: ${COLOR.PRIMARY_HOVER};

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 12px;
    padding: 6px 12px;
  }
`;

export const BotOverviewHeading = styled.h2`
  font-size: 32px;
  font-weight: 600;
  color: ${COLOR.DARK};
  line-height: 1.25;

  @media (max-width: ${BREAKPOINTS.LAPTOP}) {
    font-size: 28px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 24px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 20px;
  }
`;

export const BotOverviewCardSubContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${COLOR.WHITE};
  border-radius: 24px;
  border: 1px solid #dddddd;
  overflow: hidden;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    border-radius: 16px;
  }
`;

export const BotOverviewCardHeaderContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 14px;
    gap: 10px;
  }
`;

export const BotOverviewCardMessageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  color: ${COLOR.WHITE};
  background-color: ${COLOR.DARK};
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  font-size: 15px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

export const BotOverviewCardImage = styled(Image)`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  flex-shrink: 0;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 38px;
    height: 38px;
  }
`;

export const BotOverviewCardFooterContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  gap: 14px;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 12px;
    gap: 8px;
  }
`;

export const BotOverviewCardOrderDetailsImage = styled(Image)`
  width: 100%;
  max-width: 340px;
  height: auto;
  max-height: 430px;
  object-fit: contain;
  background-color: ${COLOR.WHITE};
  border: 1px solid #dddddd;
  border-top-right-radius: 16px;
  border-top-left-radius: 16px;
  border-bottom-right-radius: 16px;
  
  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    max-width: 300px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    max-width: 240px;
    max-height: 260px;
    border-top-right-radius: 12px;
    border-top-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`;

export const BotOverviewCardContainer2 = styled(BotOverviewCardContainer)`
  background-color: #eef9d6;
  gap: 50px;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    gap: 30px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    gap: 20px;
  }
`;

export const BotOverviewCardContainer2Image = styled(Image)`
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: contain;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    max-height: 380px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    max-height: 260px;
  }
`;

