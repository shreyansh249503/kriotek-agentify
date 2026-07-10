import styled, { keyframes } from "styled-components";

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(45, 106, 79, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(45, 106, 79, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(45, 106, 79, 0); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

// Storefront Container
export const StoreContainer = styled.div`
  min-height: 100vh;
  background: #fdfdfc;
  color: #1b4332;
  font-family: "Outfit", sans-serif;
  overflow-x: hidden;
  padding-top: 80px; // Offset for header
`;

// Store Header
export const StoreHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: rgba(253, 253, 252, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(45, 106, 79, 0.08);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.02);

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

export const StoreBrand = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #1b4332;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  span {
    color: #40916c;
  }
`;

export const StoreNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 32px;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const StoreNavLink = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #2d6a4f;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #52b788;
  }
`;

export const StoreActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const CartIndicator = styled.button`
  background: #1b4332;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: #2d6a4f;
    transform: translateY(-1px);
  }

  span {
    background: #52b788;
    color: white;
    font-size: 11px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }
`;

// Hero Section
export const HeroSection = styled.section`
  padding: 80px 40px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 450px;
  position: relative;
  text-align: center;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

export const HeroContent = styled.div`
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: ${slideUp} 0.8s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const HeroBadge = styled.span`
  background: rgba(45, 106, 79, 0.1);
  color: #1b4332;
  padding: 6px 16px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const HeroTitle = styled.h1`
  font-size: 52px;
  font-weight: 800;
  color: #1b4332;
  line-height: 1.15;
  letter-spacing: -0.02em;

  span {
    color: #40916c;
  }

  @media (max-width: 768px) {
    font-size: 38px;
  }
`;

export const HeroSub = styled.p`
  font-size: 18px;
  color: #2d6a4f;
  max-width: 600px;
  line-height: 1.6;
`;

export const HeroCTA = styled.button`
  background: #1b4332;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2d6a4f;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(27, 67, 50, 0.15);
  }
`;

// Products Section
export const ProductsSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

export const SectionHeader = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

export const SectionTitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  color: #1b4332;
`;

export const SectionSub = styled.p`
  font-size: 16px;
  color: #52b788;
  font-weight: 600;
`;

export const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  width: 100%;
`;

export const ProductCard = styled.div`
  background: white;
  border: 1px solid rgba(45, 106, 79, 0.08);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(27, 67, 50, 0.08);
    border-color: rgba(45, 106, 79, 0.15);
  }
`;

export const ProductImageWrapper = styled.div`
  width: 100%;
  height: 240px;
  overflow: hidden;
  position: relative;
  background: #f4f6f4;
`;

export const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

export const ProductBadge = styled.span`
  position: absolute;
  top: 16px;
  left: 16px;
  background: #52b788;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

export const ProductDetails = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

export const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

export const ProductTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1b4332;
  margin: 0;
`;

export const ProductPrice = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #2d6a4f;
`;

export const RatingWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ffb703;
  font-size: 14px;

  span {
    color: #52b788;
    font-size: 13px;
    font-weight: 600;
  }
`;

export const ProductDescription = styled.p`
  font-size: 14.5px;
  color: #40916c;
  line-height: 1.5;
  margin: 0;
`;

export const ProductActions = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: auto;
`;

export const PrimaryButton = styled.button`
  background: #1b4332;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #2d6a4f;
  }
`;

export const SecondaryButton = styled.button`
  background: transparent;
  color: #1b4332;
  border: 1.5px solid #1b4332;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(27, 67, 50, 0.04);
  }
`;

// Trust Badges Section
export const BadgesSection = styled.section`
  background: #f4f7f5;
  padding: 60px 40px;
  border-top: 1px solid rgba(45, 106, 79, 0.05);
  border-bottom: 1px solid rgba(45, 106, 79, 0.05);
`;

export const BadgesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 40px;

  @media (max-width: 768px) {
    justify-content: flex-start;
    gap: 30px;
  }
`;

export const BadgeCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 280px;

  svg {
    color: #40916c;
    flex-shrink: 0;
  }
`;

export const BadgeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const BadgeTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: #1b4332;
  margin: 0;
`;

export const BadgeDesc = styled.p`
  font-size: 13.5px;
  color: #52b788;
  margin: 0;
  line-height: 1.4;
`;

// Store Footer
export const StoreFooter = styled.footer`
  padding: 40px 20px;
  text-align: center;
  background: #1b4332;
  color: #d8f3dc;
  font-size: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

// CART ADDED TOAST
export const ToastMessage = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 100px;
  right: 32px;
  background: #ffffff;
  color: #1b4332;
  padding: 12px 18px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1100;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  transform: ${(props) =>
    props.$visible ? "translateY(0)" : "translateY(-20px)"};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};

  span {
    color: #52b788;
    font-size: 16px;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    right: 20px;
    left: 20px;
    top: auto;
    bottom: 100px;
  }
`;

// ==========================================
// CHATBOT WIDGET STYLES
// ==========================================

export const ChatLauncher = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #1b4332;
  color: white;
  border: none;
  cursor: pointer;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px rgba(27, 67, 50, 0.3);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${pulse} 3s infinite;

  &:hover {
    transform: scale(1.1);
    background: #2d6a4f;
  }

  svg {
    transition: transform 0.3s ease;
  }
`;

export const ChatWindow = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 104px;
  right: 24px;
  width: 400px;
  height: 620px;
  max-height: calc(100vh - 140px);
  background: white;
  border-radius: 20px;
  box-shadow: 0 12px 48px rgba(27, 67, 50, 0.18);
  border: 1px solid rgba(45, 106, 79, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9999;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: bottom right;
  transform: ${(props) =>
    props.$isOpen
      ? "scale(1) translate(0, 0)"
      : "scale(0.8) translate(20px, 20px)"};
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  pointer-events: ${(props) => (props.$isOpen ? "all" : "none")};

  @media (max-width: 480px) {
    width: calc(100vw - 32px);
    height: calc(100vh - 120px);
    right: 16px;
    left: 16px;
    bottom: 96px;
  }
`;

export const ChatHeader = styled.div`
  background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

export const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const BotAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #52b788;
  color: white;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

export const BotName = styled.span`
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

export const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #a7d8c3;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    background: #52b788;
    border-radius: 50%;
    display: inline-block;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

export const ChatBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fcfdfc;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
`;

export const MessageWrapper = styled.div<{ $isBot: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isBot ? "flex-start" : "flex-end")};
  animation: ${scaleIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  width: 100%;
`;

export const MessageBubble = styled.div<{ $isBot: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.45;
  white-space: pre-line;
  background: ${(props) => (props.$isBot ? "white" : "#1b4332")};
  color: ${(props) => (props.$isBot ? "#1b4332" : "white")};
  border: ${(props) =>
    props.$isBot ? "1px solid rgba(45, 106, 79, 0.1)" : "none"};
  border-top-left-radius: ${(props) => (props.$isBot ? "4px" : "16px")};
  border-bottom-right-radius: ${(props) => (props.$isBot ? "16px" : "4px")};
  box-shadow: ${(props) =>
    props.$isBot
      ? "0 2px 8px rgba(0,0,0,0.02)"
      : "0 4px 12px rgba(27,67,50,0.15)"};
`;

export const PresetsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
  padding-left: 4px;
  animation: ${fadeIn} 0.5s ease;
`;

export const PresetPill = styled.button`
  background: white;
  color: #2d6a4f;
  border: 1px solid rgba(45, 106, 79, 0.15);
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e8f5e9;
    border-color: #52b788;
    color: #1b4332;
    transform: translateY(-1px);
  }
`;

// Form inside Chat
export const ChatFormCard = styled.form`
  background: white;
  border: 1px solid rgba(45, 106, 79, 0.15);
  border-radius: 14px;
  padding: 16px;
  margin-top: 8px;
  width: 100%;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  animation: ${scaleIn} 0.3s ease;
`;

export const FormTitle = styled.h4`
  font-size: 13px;
  font-weight: 700;
  color: #1b4332;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(45, 106, 79, 0.2);
  outline: none;
  font-size: 13px;
  color: #1b4332;
  transition: border-color 0.2s;

  &:focus {
    border-color: #2d6a4f;
  }
`;

export const FormSubmit = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: #1b4332;
  color: white;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2d6a4f;
  }
`;

// visual product inside chat
export const ChatProductCard = styled.div`
  background: white;
  border: 1px solid rgba(45, 106, 79, 0.1);
  border-radius: 12px;
  overflow: hidden;
  width: 200px;
  margin-top: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  animation: ${scaleIn} 0.4s ease forwards;
`;

export const ChatProductImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-bottom: 1px solid rgba(45, 106, 79, 0.05);
`;

export const ChatProductDetails = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ChatProductTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #1b4332;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ChatProductPrice = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #52b788;
`;

export const ChatBuyButton = styled.button`
  background: #1b4332;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  transition: background 0.2s;

  &:hover {
    background: #2d6a4f;
  }
`;

// Input Form
export const ChatInputContainer = styled.form`
  display: flex;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid rgba(45, 106, 79, 0.08);
  align-items: center;
  gap: 10px;
`;

export const ChatTextField = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(45, 106, 79, 0.12);
  border-radius: 30px;
  outline: none;
  font-size: 13.5px;
  color: #1b4332;
  transition: all 0.2s;

  &:focus {
    border-color: #2d6a4f;
    box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.05);
  }
`;

export const ChatSendButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #1b4332;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #2d6a4f;
    transform: scale(1.05);
  }

  &:disabled {
    background: #eaeaea;
    color: #a0a0a0;
    cursor: not-allowed;
  }
`;

// Typing Indicator
export const TypingIndicatorContainer = styled.div`
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border: 1px solid rgba(45, 106, 79, 0.08);
  border-radius: 16px;
  border-top-left-radius: 4px;
  width: fit-content;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
`;

export const TypingIndicatorDot = styled.div<{ $delay: string }>`
  width: 6px;
  height: 6px;
  background: #2d6a4f;
  border-radius: 50%;
  opacity: 0.6;
  animation: ${bounce} 1s infinite ease-in-out;
  animation-delay: ${(props) => props.$delay};
`;
