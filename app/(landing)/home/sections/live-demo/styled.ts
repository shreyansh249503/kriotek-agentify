import styled, { keyframes } from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
`;

export const VisualMockup = styled.div`
  position: relative;
  width: 80%;
  height: 480px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  background: #1e1e1e;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 100%;
    height: 440px;
    padding: 16px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    height: 360px;
    padding: 12px;
  }

  /* &:hover {
    transform: translateY(-4px);
    box-shadow: 0 40px 85px rgba(168, 225, 12, 0.15);
  } */
`;

export const MockBrowserHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
`;

export const Dots = styled.div`
  display: flex;
  gap: 6px;

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);

    &:first-child {
      background: #ef4444;
    }
    &:nth-child(2) {
      background: #f59e0b;
    }
    &:last-child {
      background: #10b981;
    }
  }
`;

export const BrowserAddress = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 4px 16px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.03);
`;

export const MockStoreBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  margin-top: 10px;
`;

export const MockProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

export const MockProductCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const MockImagePlaceholder = styled.div`
  background: rgba(255, 255, 255, 0.05);
  height: 120px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.2);

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    height: 70px;
  }
`;

export const MockProductTitle = styled.div`
  width: 70%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
`;

export const MockProductPrice = styled.div`
  width: 40%;
  height: 8px;
  background: ${COLOR.PRIMARY};
  border-radius: 4px;
`;

export const MockBotBubble = styled.div`
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  padding: 12px 18px;
  border-radius: 16px;
  border-bottom-right-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 10px 25px rgba(168, 225, 12, 0.25);
  animation: ${float} 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    bottom: 12px;
    right: 12px;
    padding: 8px 12px;
    font-size: 11px;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -6px;
    right: 0;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 0px solid transparent;
    border-top: 8px solid ${COLOR.PRIMARY};
  }
`;

export const LiveDemoMainConatiner = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 130px 0px;
  background-color: #f5f8f8;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 60px 0px;
  }
`;

export const LiveDemoSectionHeader = styled.div`
  width: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 90%;
    flex-direction: column-reverse;
    gap: 40px;
  }
`;

export const LiveDemoPrimarySection = styled.div`
  width: 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 30px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 100%;
    align-items: center;
    text-align: center;
    gap: 24px;
  }
`;

export const LiveDemoTitleBtn = styled.div`
  width: fit-content;
  padding: 10px 18px;
  background-color: ${COLOR.WHITE};
  border-radius: 24px;
  border: 1px solid ${COLOR.BORDER};
  font-size: 15px;
  font-weight: 500;
  color: ${COLOR.PRIMARY_HOVER};
`;

export const LiveDemoHeading = styled.h2`
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

export const LiveDemoDescription = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  max-width: 85%;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    max-width: 100%;
  }
`;

export const LiveDemoListHeading = styled.h3`
  font-size: 18px;
  color: ${COLOR.DARK};
`;

export const LiveDemoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    align-items: flex-start;
    text-align: left;
  }
`;

export const LiveDemoListItem = styled.div`
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

export const LiveDemoSecondarySection = styled.div`
  width: 55%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 100%;
  }
`;
