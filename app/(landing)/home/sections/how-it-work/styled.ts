"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Image from "next/image";
import styled, { keyframes } from "styled-components";

const float1 = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const float2 = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(8px) rotate(-4deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const float3 = keyframes`
  0% { transform: translateX(0px) translateY(0px); }
  50% { transform: translateX(-5px) translateY(-5px); }
  100% { transform: translateX(0px) translateY(0px); }
`;

export const HowItWorkMainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 65px;
  padding: 110px 0px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 60px 0px;
    gap: 40px;
  }
`;

export const HowItWorkHeaderSection = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 18px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 90%;
    text-align: center;
  }
`;

export const HowItWorkHeading = styled.h2`
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

export const HowItWorkDescription = styled.p`
  max-width: 65%;
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  text-align: center;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    max-width: 100%;
  }
`;

export const HowItWorkSectionConatiner = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 100px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 90%;
    gap: 60px;
  }
`;

export const StepRow = styled.div<{ isReversed?: boolean }>`
  width: 80%;
  display: flex;
  flex-direction: ${(props) => (props.isReversed ? "row-reverse" : "row")};
  justify-content: space-between;
  align-items: center;
  gap: 40px;

  @media (max-width: 968px) {
    flex-direction: column;
    gap: 60px;
    width: 100%;
  }
`;

export const StepContentColumn = styled.div`
  width: 50%;
  display: flex;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 968px) {
    width: 100%;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

export const StepNumber = styled.span`
  font-size: 72px;
  font-weight: 800;
  color: ${COLOR.DARK};
  line-height: 0.8;
  opacity: 0.95;
  letter-spacing: -2px;
`;

export const StepTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const StepTitle = styled.h3`
  font-size: 26px;
  font-weight: 700;
  color: ${COLOR.DARK};
  line-height: 1.2;
`;

export const StepDescription = styled.p`
  font-size: 15px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
  max-width: 440px;
  font-weight: 400;
`;

export const StepImageColumn = styled.div`
  width: 50%;
  height: 100px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 30px;

  @media (max-width: 968px) {
    width: 100%;
    justify-content: center;
    padding-left: 0;
  }
`;

export const InnerGreenCard = styled.div`
  position: relative;
  width: 400px;
  height: 100px;
  background-color: ${COLOR.PRIMARY};
  border-radius: 12px;

  @media (max-width: 450px) {
    width: 280px;
  }
`;

export const StepImage = styled(Image)<{ $stepId?: string }>`
  position: absolute;
  height: auto;
  object-fit: contain;

  ${({ $stepId }) => {
    switch ($stepId) {
      case "01":
        return `
          top: -42px;
          left: 80px;
          width: 245px;
        `;
      case "02":
        return `
          top: -35px;
          left: 120px;
          width: 160px;
        `;
      case "03":
        return `
         top: -42px;
          left: 105px;
          width: 170px;
          
        `;
      case "04":
        return `
         top: -40px;
          left: 100px;
          width: 190px;
        `;
      default:
        return `
          top: -30px;
          left: 90px;
          width: 220px;
        `;
    }
  }}

  @media (max-width: 450px) {
    ${({ $stepId }) => {
      switch ($stepId) {
        case "01":
          return `
            top: -26px;
            left: 45px;
            width: 180px;
          `;
        case "02":
          return `
            top: -35px;
            left: 75px;
            width: 130px;
          `;
        case "03":
          return `
            top: -30px;
            left: 65px;
            width: 145px;
          `;
        case "04":
          return `
            top: -30px;
            left: 75px;
            width: 130px;
          `;
        default:
          return `
            top: -20px;
            left: 60px;
            width: 150px;
          `;
      }
    }}
  }
`;

export const LeftTopFlowtingDiv = styled.div`
  position: absolute;
  top: -17px;
  left: 30px;
  width: 35px;
  height: 35px;
  background-color: #d4f77d;
  border-radius: 4px;
  animation: ${float1} 4s ease-in-out infinite;
`;
export const RightBottomFlowtingDiv = styled.div`
  position: absolute;
  bottom: -8px;
  right: 20px;
  width: 20px;
  height: 20px;
  background-color: #7ead21;
  border-radius: 4px;
  animation: ${float2} 5s ease-in-out infinite;
`;
export const CenterBottomFlowtingDiv = styled.div`
  position: absolute;
  bottom: -30px;
  right: 60%;
  width: 15px;
  height: 15px;
  background-color: #abbb33;
  border-radius: 2px;
  animation: ${float3} 6s ease-in-out infinite;
`;
export const RightTopFlowtingDiv = styled.div`
  position: absolute;
  top: -27px;
  right: 65px;
  width: 14px;
  height: 14px;
  background-color: #abbb33;
  border-radius: 2px;
  animation: ${float1} 3s ease-in-out infinite 0.5s;
`;
export const SecondRightTopFlowtingDiv = styled.div`
  position: absolute;
  top: -20px;
  right: 45px;
  width: 10px;
  height: 10px;
  background-color: #70b953;
  border-radius: 2px;
  animation: ${float2} 4.5s ease-in-out infinite 1s;
`;
