import styled, { keyframes } from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
`;

export const LiveDemoMainConatiner = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px 0px;
  background-color: #f5f8f8;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    padding: 60px 0px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 40px 0px;
  }
`;

export const LiveDemoSectionHeader = styled.div`
  width: 80%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 50px;

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

export const LiveDemoPrimarySection = styled.div`
  width: 45%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 100%;
    align-items: flex-start;
    text-align: left;
    gap: 20px;
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

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 13px;
    padding: 8px 14px;
  }
`;

export const LiveDemoHeading = styled.h2`
  font-size: 38px;
  font-weight: 600;
  color: ${COLOR.DARK};
  line-height: 1.2;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    font-size: 32px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 26px;
  }
`;

export const LiveDemoDescription = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  max-width: 100%;
  line-height: 1.5;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 14px;
  }
`;

export const LiveDemoListHeading = styled.h3`
  font-size: 18px;
  color: ${COLOR.DARK};
  font-weight: 600;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 16px;
  }
`;

export const LiveDemoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`;

export const LiveDemoListItem = styled.div`
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

export const LiveDemoSecondarySection = styled.div`
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 100%;
  }
`;

export const VisualMockup = styled.div`
  position: relative;
  width: 90%;
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
  box-sizing: border-box;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    height: 440px;
    padding: 20px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 98%;
    height: 300px;
    padding: 14px;
    border-radius: 16px;
  }
`;

export const MockBrowserHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
  gap: 8px;
`;

export const Dots = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;

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
  padding: 4px 12px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 10px;
    max-width: 160px;
    padding: 4px 8px;
  }
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

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    gap: 8px;
  }
`;

export const MockProductCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 6px;
    gap: 6px;
    border-radius: 8px;
  }
`;

export const MockImagePlaceholder = styled.div`
  background: rgba(255, 255, 255, 0.05);
  height: 120px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.2);

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    height: 100px;
  }

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
  white-space: nowrap;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    bottom: 12px;
    right: 12px;
    padding: 8px 12px;
    font-size: 11px;
    border-radius: 12px;
    border-bottom-right-radius: 2px;
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

