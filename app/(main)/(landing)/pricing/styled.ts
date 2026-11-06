import styled, { keyframes } from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 225, 12, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(168, 225, 12, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 225, 12, 0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const PricingSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 140px 24px 100px;
  background: linear-gradient(180deg, ${COLOR.WHITE} 0%, ${COLOR.LIGHT} 100%);
  background-image: radial-gradient(circle at 1px 1px, ${COLOR.BORDER} 1.5px, transparent 0);
  background-size: 48px 48px;
  position: relative;
  overflow: hidden;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 100px 20px 60px;
  }
`;

export const PricingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 2;
  gap: 80px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    gap: 60px;
  }
`;

export const HeaderArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  max-width: 800px;
`;

export const Badge = styled.span`
  background: ${COLOR.BACKGROUND_2};
  color: ${COLOR.DARK};
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid ${COLOR.BORDER};
  box-shadow: 0 2px 10px rgba(168, 225, 12, 0.15);
`;

export const PageTitle = styled.h1`
  font-size: 56px;
  font-weight: 800;
  color: ${COLOR.DARK};
  letter-spacing: -0.03em;
  line-height: 1.1;

  span {
    background: linear-gradient(135deg, ${COLOR.DARK} 0%, ${COLOR.PRIMARY_HOVER} 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 40px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 32px;
  }
`;

export const PageSubtitle = styled.p`
  font-size: 20px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
  max-width: 600px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 16px;
  }
`;

export const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: ${COLOR.WHITE};
  padding: 8px 16px;
  border-radius: 50px;
  border: 1px solid ${COLOR.BORDER};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  margin-top: 10px;
`;

export const ToggleLabel = styled.span<{ $isActive: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.$isActive ? COLOR.DARK : COLOR.TEXT_SECONDARY};
  transition: color 0.3s ease;
  cursor: pointer;
`;

export const ToggleSwitch = styled.div`
  width: 56px;
  height: 28px;
  background: ${COLOR.CREAM};
  border-radius: 14px;
  padding: 3px;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: background 0.3s ease;

  &::after {
    content: "";
    width: 22px;
    height: 22px;
    background: ${COLOR.PRIMARY};
    border-radius: 50%;
    position: absolute;
    left: 3px;
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  }

  &.yearly::after {
    transform: translateX(28px);
  }
`;

export const DiscountBadge = styled.span`
  background: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  animation: ${pulse} 2.5s infinite;
  display: inline-block;
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  width: 100%;
  align-items: stretch;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    grid-template-columns: repeat(2, 1fr);
    max-width: 800px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
    max-width: 400px;
    gap: 40px;
  }
`;

export const PlanCard = styled.div<{ $isPopular?: boolean }>`
  background: ${COLOR.WHITE};
  border: ${props => props.$isPopular ? `2px solid ${COLOR.PRIMARY}` : `1px solid ${COLOR.BORDER}`};
  border-radius: 28px;
  padding: 48px 36px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: ${props => props.$isPopular 
    ? "0 20px 40px rgba(168, 225, 12, 0.15)" 
    : "0 10px 30px rgba(0, 0, 0, 0.02)"};

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.$isPopular 
      ? "0 30px 60px rgba(168, 225, 12, 0.25)" 
      : `0 20px 40px rgba(0, 0, 0, 0.06), 0 0 0 1px ${COLOR.PRIMARY}`};
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 36px 28px;
  }
`;

export const PopularBadge = styled.div`
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: ${COLOR.DARK};
  color: ${COLOR.PRIMARY};
  padding: 6px 16px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 6px;
  animation: ${float} 3s ease-in-out infinite;
`;

export const CardTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

export const PlanName = styled.h3`
  font-size: 24px;
  font-weight: 800;
  color: ${COLOR.DARK};
`;

export const PlanDesc = styled.p`
  font-size: 15px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.5;
`;

export const PriceWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 10px;
`;

export const Currency = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: ${COLOR.DARK};
`;

export const Price = styled.span`
  font-size: 56px;
  font-weight: 800;
  color: ${COLOR.DARK};
  letter-spacing: -0.02em;
  transition: opacity 0.2s ease;
`;

export const Period = styled.span`
  font-size: 15px;
  color: ${COLOR.TEXT_SECONDARY};
  font-weight: 500;
`;

export const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FeatureItem = styled.li<{ $isIncluded?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14.5px;
  color: ${props => props.$isIncluded !== false ? COLOR.TEXT : COLOR.TEXT_SECONDARY + "88"};
  line-height: 1.4;

  svg {
    margin-top: 2px;
    flex-shrink: 0;
    color: ${props => props.$isIncluded !== false ? COLOR.PRIMARY_HOVER : COLOR.TEXT_SECONDARY + "55"};
  }
`;

export const CTAButton = styled.button<{ $isPrimary?: boolean }>`
  width: 100%;
  padding: 16px 24px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  border: ${props => props.$isPrimary ? "none" : `1px solid ${COLOR.BORDER}`};
  background: ${props => props.$isPrimary ? COLOR.PRIMARY : COLOR.WHITE};
  color: ${COLOR.DARK};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${props => props.$isPrimary ? COLOR.PRIMARY_HOVER : COLOR.LIGHT};
    transform: translateY(-2px);
    box-shadow: ${props => props.$isPrimary 
      ? "0 8px 20px rgba(168, 225, 12, 0.35)" 
      : "0 8px 15px rgba(0, 0, 0, 0.05)"};
  }

  &:active {
    transform: translateY(0);
  }
`;

export const CompareSection = styled.div`
  width: 100%;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
`;

export const SectionTitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  color: ${COLOR.DARK};
  text-align: center;
  letter-spacing: -0.02em;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 28px;
  }
`;

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.01);
  padding: 10px 0;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${COLOR.BORDER};
    border-radius: 3px;
  }
`;

export const CompareTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 800px;
`;

export const TableHead = styled.thead`
  border-bottom: 2px solid ${COLOR.BORDER};
`;

export const TableRow = styled.tr<{ $isHeader?: boolean }>`
  border-bottom: 1px solid ${COLOR.BORDER};
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  ${props => !props.$isHeader && `
    &:hover {
      background: ${COLOR.LIGHT}55;
    }
  `}
`;

export const TableHeaderCell = styled.th`
  padding: 24px;
  font-size: 16px;
  font-weight: 700;
  color: ${COLOR.DARK};

  &:first-child {
    font-size: 18px;
    width: 35%;
  }

  &:not(:first-child) {
    text-align: center;
    width: 21.6%;
  }
`;

export const TableCell = styled.td`
  padding: 20px 24px;
  font-size: 14.5px;
  color: ${COLOR.TEXT};

  &:first-child {
    font-weight: 600;
    color: ${COLOR.DARK};
  }

  &:not(:first-child) {
    text-align: center;
  }

  svg {
    color: ${COLOR.PRIMARY_HOVER};
  }
`;

export const FaqSection = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

export const FaqList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

export const FaqCard = styled.div<{ $isOpen: boolean }>`
  background: ${COLOR.WHITE};
  border: 1px solid ${props => props.$isOpen ? COLOR.PRIMARY : COLOR.BORDER};
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.03);
  }
`;

export const FaqQuestionButton = styled.button`
  width: 100%;
  padding: 24px;
  background: none;
  border: none;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  color: ${COLOR.DARK};
  gap: 20px;

  svg {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    color: ${COLOR.TEXT_SECONDARY};
    flex-shrink: 0;
  }
`;

export const FaqAnswerWrapper = styled.div<{ $maxHeight: string }>`
  max-height: ${props => props.$maxHeight};
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const FaqAnswerContent = styled.div`
  padding: 0 24px 24px;
  font-size: 14.5px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
`;
