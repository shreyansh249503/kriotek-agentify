import styled, { keyframes } from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(168, 225, 12, 0.4); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(168, 225, 12, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(168, 225, 12, 0); }
`;

export const SalesSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 24px;
  background: linear-gradient(180deg, ${COLOR.WHITE} 0%, ${COLOR.LIGHT} 100%);
  position: relative;
  overflow: hidden;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 80px 20px;
  }
`;

export const ShowcaseContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 60px;
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 2;
`;

export const HeaderWrapper = styled.div`
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

export const ShowcaseTitle = styled.h2`
  font-size: 42px;
  font-weight: 800;
  color: ${COLOR.DARK};
  letter-spacing: -0.02em;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 32px;
  }
`;

export const ShowcaseSubtitle = styled.p`
  font-size: 18px;
  color: ${COLOR.TEXT_SECONDARY};
  max-width: 650px;
  line-height: 1.6;
`;

export const ContentSplit = styled.div`
  display: grid;
  grid-template-columns: 1.12fr 1fr;
  gap: 64px;
  align-items: center;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: 1fr;
    gap: 48px;
  }
`;

export const InfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

export const ShowcaseCard = styled.div`
  display: flex;
  gap: 20px;
  background: ${COLOR.WHITE};
  padding: 24px;
  border-radius: 16px;
  border: 1px solid ${COLOR.BORDER};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border-color: ${COLOR.PRIMARY};
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 12px;
  background: ${COLOR.BACKGROUND_2};
  color: ${COLOR.DARK};
  font-size: 24px;
  border: 1px solid ${COLOR.BORDER};
`;

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${COLOR.DARK};
`;

export const CardDesc = styled.p`
  font-size: 14px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.5;
`;

export const ChatColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
`;

export const ChatDevice = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
  height: 520px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

export const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${COLOR.BORDER};
  background: linear-gradient(135deg, ${COLOR.CREAM} 0%, ${COLOR.WHITE} 100%);
`;

export const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const BotAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 1.5px solid ${COLOR.WHITE};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const StatusWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const BotName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${COLOR.DARK};
`;

export const BotStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: ${COLOR.TEXT_SECONDARY};

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    display: inline-block;
  }
`;

export const ModeBadge = styled.div`
  background: #10b98122;
  color: #047857;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: ${pulse} 2s infinite;
`;

export const ChatBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fafaf9;
  scroll-behavior: smooth;
`;

export const MessageWrapper = styled.div<{ $isBot: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isBot ? "flex-start" : "flex-end"};
  animation: ${fadeIn} 0.3s ease-out forwards;
`;

export const MessageBubble = styled.div<{ $isBot: boolean }>`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.5;
  white-space: pre-line;
  background: ${props => props.$isBot ? COLOR.WHITE : COLOR.PRIMARY};
  color: ${props => props.$isBot ? COLOR.TEXT : COLOR.DARK};
  border: ${props => props.$isBot ? `1px solid ${COLOR.BORDER}` : "none"};
  border-top-left-radius: ${props => props.$isBot ? "4px" : "16px"};
  border-bottom-right-radius: ${props => props.$isBot ? "16px" : "4px"};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.01);
`;

export const ProductCard = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 12px;
  overflow: hidden;
  margin-top: 8px;
  width: 240px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  animation: ${fadeIn} 0.4s ease-out forwards;
`;

export const ProductImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-bottom: 1px solid ${COLOR.BORDER};
`;

export const ProductDetails = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ProductTitle = styled.h4`
  font-size: 13.5px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin: 0;
`;

export const ProductPrice = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #047857;
`;


export const TypingContainer = styled.div`
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 16px;
  border-top-left-radius: 4px;
  width: fit-content;
  align-items: center;
`;

export const TypingDot = styled.div<{ $delay: string }>`
  width: 6px;
  height: 6px;
  background: ${COLOR.TEXT_SECONDARY};
  border-radius: 50%;
  opacity: 0.6;
  animation: ${bounce} 1s infinite ease-in-out;
  animation-delay: ${props => props.$delay};
`;

export const DemoControl = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
`;

export const DemoButton = styled.button`
  background: none;
  border: none;
  color: ${COLOR.TEXT_SECONDARY};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;

  &:hover {
    color: ${COLOR.DARK};
  }
`;
