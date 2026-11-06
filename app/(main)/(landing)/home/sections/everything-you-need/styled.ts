"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Image from "next/image";
import styled from "styled-components";

export const EveryThingYouNeedMainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f8f8;
  padding: 100px 0px;
  gap: 60px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 60px 0px;
    gap: 40px;
  }
`;

export const EverythingYouNeedSectionHeader = styled.div`
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

export const EverythingYouNeedTitleBtn = styled.div`
  width: fit-content;
  padding: 10px 18px;
  background-color: ${COLOR.WHITE};
  border-radius: 24px;
  border: 1px solid ${COLOR.BORDER};
  font-size: 15px;
  font-weight: 500;
  color: ${COLOR.PRIMARY_HOVER};
`;

export const EverythingYouNeedHeading = styled.h2`
  font-size: 38px;
  font-weight: 600;
  color: ${COLOR.DARK};
  line-height: 1.2;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 32px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 26px;
  }
`;

export const EverythingYouNeedSectionConatiner = styled.div`
  width: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 90%;
    gap: 20px;
  }
`;

export const EverythingYouNeedCardContainer = styled.div`
  width: 360px;
  height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 20px;
  background-color: ${COLOR.WHITE};
  border-radius: 24px;
  border: 1px solid #eff3e7;
`;

export const EverythingYouNeedCardImage = styled(Image)`
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 20px;
`;

export const EverythingYouNeedCardSubContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
`;

export const EverythingYouNeedCardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${COLOR.DARK};
  line-height: 1.2;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 18px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 16px;
  }
`;

export const EverythingYouNeedCardDescription = styled.p`
  font-size: 14px;
  color: #706f6f;
  line-height: 1.3;
  font-weight: 450;
`;
