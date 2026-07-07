"use client";

import { COLOR } from "@/styles";
import Image from "next/image";
import styled from "styled-components";

export const WhatAgentigyProvidesMainConatiner = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f8f8;
  padding: 60px 0px;
`;

export const WhatAgentigyProvidesSectionHeader = styled.div`
  width: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

export const WhatAgentigyProvidesPrimarySection = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 38px;
`;

export const WhatAgentifyProvidesTitleBtn = styled.div`
  width: fit-content;
  padding: 10px 18px;
  background-color: ${COLOR.WHITE};
  border-radius: 24px;
  border: 1px solid ${COLOR.BACKGROUND_2};
  font-size: 15px;
  font-weight: 500;
  color: ${COLOR.PRIMARY_HOVER};
`;

export const WhatAgentifyProvidesHeading = styled.h2`
  font-size: 38px;
  font-weight: 600;
  color: ${COLOR.DARK};
  line-height: 1.2;
`;

export const WhatAgentifyProvidesDescription = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  max-width: 85%;
`;

export const WhatAgentigyProvidesSecondarySection = styled.div`
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;

export const WGPCardHoverBg = styled.div`
  position: absolute;
  top: 126px;
  left: 60px;
  width: 0px;
  height: 0px;
  background-color: ${COLOR.PRIMARY};
  z-index: 1;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition:
    width 0.8s cubic-bezier(0.4, 0, 0.2, 1),
    height 0.8s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.4s ease-out;
  pointer-events: none;
`;

export const WGPCardUpperInnerContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  background-color: ${COLOR.PRIMARY};
  transition: background-color 0.3s ease;
`;

export const WGPCardDescription = styled.p`
  font-size: 13.5px;
  color: ${COLOR.TEXT_SECONDARY};
  font-weight: 450;
  transition: color 0.3s ease;
`;

export const WhatAgentifyProvidesCardContainer = styled.div`
  width: 43%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
  padding: 16px 10px;
  border-radius: 10px;
  background-color: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BACKGROUND_2};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
  }

  &:hover ${WGPCardHoverBg} {
    opacity: 1;
    width: 1000px;
    height: 1000px;
  }

  &:hover ${WGPCardUpperInnerContainer} {
    background-color: ${COLOR.WHITE};
  }

  &:hover ${WGPCardDescription} {
    color: ${COLOR.DARK};
  }
`;

export const WGPCardUpperContainer = styled.div`
  width: 100%;
  height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 10px;
  position: relative;
  z-index: 2;
`;

export const WAPCardImage = styled(Image)`
  position: absolute;
  top: -66px;
  right: -100px;
  width: auto;
  height: auto;
  object-fit: contain;
`;

export const WAPCardImage2 = styled(WAPCardImage)`
  top: -60px;
  right: -110px;
`;

export const WAPCardImage3 = styled(WAPCardImage)`
  top: -56px;
  right: -100px;
`;

export const WAPCardImage4 = styled(WAPCardImage)`
  top: -50px;
  right: -70px;
`;

export const WGPCardLowerContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  position: relative;
  z-index: 2;
`;

export const WGPCardTitle = styled.h3`
  font-size: 19px;
  font-weight: 700;
  color: ${COLOR.DARK};
`;
