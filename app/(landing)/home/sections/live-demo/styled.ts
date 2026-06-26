import styled, { keyframes } from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
`;

export const DemoTeaserSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 24px;
  background: linear-gradient(180deg, ${COLOR.LIGHT} 0%, ${COLOR.WHITE} 100%);
  position: relative;
  overflow: hidden;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 80px 20px;
  }
`;

export const TeaserContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  max-width: 1100px;
  width: 100%;
  position: relative;
  z-index: 2;
`;

export const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
`;

export const Badge = styled.span`
  background: ${COLOR.BACKGROUND_2};
  color: ${COLOR.DARK};
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid ${COLOR.BORDER};
`;

export const TeaserTitle = styled.h2`
  font-size: 40px;
  font-weight: 800;
  color: ${COLOR.DARK};
  letter-spacing: -0.02em;
  max-width: 800px;
  line-height: 1.2;

  span {
    color: ${COLOR.PRIMARY_HOVER};
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 32px;
  }
`;

export const TeaserSubtitle = styled.p`
  font-size: 18px;
  color: ${COLOR.TEXT_SECONDARY};
  max-width: 650px;
  line-height: 1.6;
`;

export const InteractiveShowcase = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  width: 100%;
  margin-top: 20px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

export const VisualMockup = styled.div`
  background: #1e1e1e;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  min-height: 340px;
  justify-content: space-between;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 40px 85px rgba(168, 225, 12, 0.15);
  }
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

    &:first-child { background: #ef4444; }
    &:nth-child(2) { background: #f59e0b; }
    &:last-child { background: #10b981; }
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
  height: 60px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.2);
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

export const DetailsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
  text-align: left;
`;

export const BenefitList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: ${COLOR.TEXT};
  font-weight: 500;

  svg {
    color: ${COLOR.PRIMARY_HOVER};
    flex-shrink: 0;
  }
`;
