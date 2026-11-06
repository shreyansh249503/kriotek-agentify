import Image from "next/image";
import styled, { keyframes } from "styled-components";

// const slideUp = keyframes`
//   from { opacity: 0; transform: translateY(30px); }
//   to { opacity: 1; transform: translateY(0); }
// `;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
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

export const StoreContainer = styled.div`
  min-height: 100vh;
  background: #fdfdfc;
  color: #1b4332;
  font-family: "Outfit", sans-serif;
  overflow-x: hidden;
  padding-top: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const HeroSection = styled.section`
  width: 100%;
  padding: 0px 40px;
  background: #f4f4f4;
  min-height: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  @media (max-width: 1024px) {
    padding: 40px 20px 0px 20px;
    min-height: 600px;
  }
`;

export const HeroContainer = styled.div`
  width: 80%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;

  @media (max-width: 968px) {
    width: 95%;
    grid-template-columns: 1fr;
    gap: 60px;
  }
`;

export const HeroLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  z-index: 2;
`;

export const HeroBadge = styled.span`
  color: #e67e22;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

export const HeroTitle = styled.h1`
  font-size: 56px;
  font-weight: 700;
  color: #111111;
  line-height: 1.1;
  letter-spacing: -0.02em;

  span {
    color: #111111;
  }

  @media (max-width: 1024px) {
    font-size: 44px;
  }

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

export const HeroSub = styled.p`
  font-size: 18px;
  color: #555555;
  max-width: 480px;
  line-height: 1.5;
`;

export const HeroCTAWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const HeroPrimaryCTA = styled.button`
  background: #e67e22;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(230, 126, 34, 0.3);

  &:hover {
    background: #d35400;
    transform: translateY(-2px);
  }
`;

export const HeroSecondaryCTA = styled.button`
  background: #e0e0e0;
  color: #333333;
  border: 1px solid #d0d0d0;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #d5d5d5;
    transform: translateY(-2px);
  }
`;

export const HeroSocialProof = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

export const AvatarGroup = styled.div`
  display: flex;
  align-items: center;
`;

export const AvatarImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
  margin-left: -10px;

  &:first-child {
    margin-left: 0;
  }
`;

export const SocialProofText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #333333;
`;

export const HeroRight = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const HeroVisualContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 550px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 500px) {
    height: 250px;
  }
`;

export const HeroBgShape = styled(Image)`
  position: absolute;
  z-index: 1;
  width: 850px !important;
  max-width: none !important;
  height: auto !important;
  object-fit: contain;
  pointer-events: none;
  top: 80%;
  left: 20%;
  transform: translate(-50%, -50%);

  @media (max-width: 968px) {
    width: 500px !important;
  }

  @media (max-width: 480px) {
    top: 65%;
    width: 400px !important;
  }
`;

export const HeroBgShape2 = styled(Image)`
  position: absolute;
  z-index: 1;
  width: 850px !important;
  max-width: none !important;
  height: auto !important;
  object-fit: contain;
  pointer-events: none;
  top: 80%;
  left: 65%;
  transform: translate(-50%, -50%);

  @media (max-width: 968px) {
    width: 500px !important;
  }

  @media (max-width: 480px) {
    top: 65%;
    width: 400px !important;
  }
`;

export const HeroMainImageWrapper = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-top: 150px;

  img {
    height: 73vh;
    max-height: 550px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.15));
  }

  @media (max-width: 968px) {
    margin-top: 20px;
    img {
      height: 45vh;
      max-height: 380px;
    }
  }

  @media (max-width: 480px) {
    margin-top: 10px;
    img {
      height: 35vh;
      max-height: 280px;
    }
  }
`;

export const FloatingProductCard = styled.div<{
  $position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}>`
  position: absolute;
  z-index: 3;
  width: 150px;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  ${(props) =>
    props.$position === "top-left" &&
    `
    top: 100px;
    left: -30px;
  `}

  ${(props) =>
    props.$position === "top-right" &&
    `
    top: 180px;
    right: -50px;
  `}

  ${(props) =>
    props.$position === "bottom-left" &&
    `
    bottom: 120px;
    left: -120px;
  `}

  ${(props) =>
    props.$position === "bottom-right" &&
    `
    bottom: 60px;
    right: -120px;
  `}

  @media (max-width: 1200px) {
    ${(props) =>
      props.$position === "bottom-left" &&
      `
      left: -20px;
    `}
    ${(props) =>
      props.$position === "bottom-right" &&
      `
      right: -20px;
    `}
  }

  @media (max-width: 768px) {
    display: none;
  }

  @media (max-width: 600px) {
    width: 120px;
    padding: 8px;
  }
`;

export const FloatingCardImage = styled(Image)`
  width: 100%;
  height: 90px;
  object-fit: contain;
  border-radius: 8px;
`;

export const FloatingCardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const FloatingCardTitle = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #111111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FloatingCardPrice = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #666666;
`;

export const InfoSection = styled.div`
  width: 85%;
  /* max-width: 1280px; */
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  justify-items: center;
  gap: 30px;
  padding: 40px 20px;
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    padding: 30px 20px;
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 24px 16px;
  }
`;

export const InfoCardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  width: 100%;

  @media (max-width: 576px) {
    justify-content: flex-start;
    padding: 0 12px;
  }
`;

export const InfoCardIconContainer = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
`;

export const InfoCardIcon = styled(Image)`
  width: 40px;
  height: 40px;
  object-fit: contain;
`;

export const InfoCardDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const InfoCardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #111111;
`;

export const InfoCardDescription = styled.p`
  font-size: 16px;
  color: #666666;
`;

export const CategorieSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  padding: 40px 20px;
`;

export const CategorieSectionHeader = styled.div`
  width: 80%;
  /* max-width: 1280px; */
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 968px) {
    width: 92%;
  }

  @media (max-width: 576px) {
    width: 100%;
    padding: 0 10px;
  }
`;

export const CategorieSectionTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #111111;
`;

export const CategorieSectionSeeAll = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: #111111;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

export const CategorieSectionCardContainer = styled.div`
  width: 80%;
  /* max-width: 1280px; */
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  justify-items: center;
  align-items: center;
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    width: 90%;
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    width: 100%;
  }
`;

export const CategorieSectionCard = styled.div<{
  $bg?: string;
  $borderColor?: string;
}>`
  position: relative;
  width: 100%;
  max-width: 330px;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 10px;
  border: 1px solid ${(props) => props.$borderColor || "#e0e0e0"};
  background: ${(props) => props.$bg || "#c0ad9c"};
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  }
`;

export const CategorieSectionCardImage = styled(Image)<{
  $objectFit?: "cover" | "contain" | "fill";
  $marginTop?: string;
  $transform?: string;
  $padding?: string;
  $width?: string;
  $height?: string;
}>`
  width: ${(props) => props.$width || "100%"};
  height: ${(props) => props.$height || "100%"};
  object-fit: ${(props) => props.$objectFit || "cover"};
  border-radius: 10px;
  margin-top: ${(props) => props.$marginTop || "40px"};
  transform: ${(props) => props.$transform || "none"};
  padding: ${(props) => props.$padding || "0"};
  transition: transform 0.4s ease;

  ${CategorieSectionCard}:hover & {
    transform: ${(props) =>
      props.$transform && props.$transform !== "none"
        ? `${props.$transform} scale(1.05)`
        : "scale(1.05)"};
  }
`;

export const CategorieSectionCardInnerInfo = styled.div`
  position: absolute;
  bottom: 10px;
  width: 92%;
  height: 30%;
  left: 4%;
  right: 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  border-radius: 8px;
  background-color: white;
  opacity: 0.9;
  padding: 15px;
`;

export const CategorieSectionCardTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #111111;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const CategorieSectionCardShopNow = styled.p`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #111111;
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const ProductsSection = styled.section`
  width: 80%;
  /* max-width: 1280px; */
  padding: 80px 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media (max-width: 1024px) {
    width: 92%;
    padding: 60px 20px;
  }

  @media (max-width: 576px) {
    width: 100%;
    padding: 40px 16px;
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
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 32px;
`;

export const ProductCard = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid rgba(45, 106, 79, 0.08);
  border-radius: 20px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(27, 67, 50, 0.08);
    border-color: rgba(45, 106, 79, 0.15);
  }
`;

export const ProductImageWrapper = styled.div`
  width: 100%;
  height: 300px;
  overflow: hidden;
  position: relative;
  background: #f4f6f4;
`;

export const ProductImage = styled(Image)`
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
  font-size: 18px;
  font-weight: 600;
  color: #1b4332;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.35;
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
  /* line-height: 1.5; */
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.35;
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

// Loading & Empty States
export const SkeletonCard = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid rgba(45, 106, 79, 0.08);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
`;

export const SkeletonImage = styled.div`
  width: 100%;
  height: 300px;
  background: linear-gradient(90deg, #f4f6f4 0%, #e8ebe8 50%, #f4f6f4 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

export const SkeletonDetails = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SkeletonText = styled.div<{ $width?: string; $height?: string }>`
  width: ${(props) => props.$width || "100%"};
  height: ${(props) => props.$height || "16px"};
  border-radius: 8px;
  background: linear-gradient(90deg, #f4f6f4 0%, #e8ebe8 50%, #f4f6f4 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

export const SkeletonButton = styled.div`
  width: 100%;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f4f6f4 0%, #e8ebe8 50%, #f4f6f4 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 16px;
  background: white;
  border-radius: 20px;
  border: 1px dashed rgba(45, 106, 79, 0.2);
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
`;

export const EmptyStateTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1b4332;
  margin: 0;
`;

export const EmptyStateDesc = styled.p`
  font-size: 14px;
  color: #52b788;
  margin: 0;
  max-width: 360px;
  line-height: 1.5;
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
  font-family: "Outfit", sans-serif;
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

// Categorized Products Section Styles
export const CategoryGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const CategoryGroupHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CategoryGroupTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #111111;
  margin: 0;
`;

export const CategoryGroupViewAll = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #111111;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
`;

export const CategoryProductsGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  @media (max-width: 868px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const CategoryProductCard = styled.div`
  position: relative;
  width: 100%;
  background: #f4f4f6;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  border: 1px solid #d1d1d3;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
  }
`;

export const WishlistButton = styled.button<{ $isLiked?: boolean }>`
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

export const CategoryProductImageWrapper = styled.div`
  width: 100%;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const CategoryProductImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const CategoryProductInfo = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 15px 18px 15px;
`;

export const CategoryProductTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: #111111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CategoryProductPrice = styled.span`
  font-size: 13.5px;
  font-weight: 700;
  color: #333333;
`;

export const CategoryProductRatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const StarsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const ReviewsText = styled.span`
  font-size: 12px;
  color: #777777;
  font-weight: 500;
  margin-left: 2px;
`;

export const CartCircleButton = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #18181b;
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;

  &:hover {
    background: #27272a;
    transform: scale(1.08);
  }
`;

export const SubCategoryContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const SubCategoryPill = styled.button<{ $active?: boolean }>`
  background: ${(props) => (props.$active ? "#111111" : "#f0f0f2")};
  color: ${(props) => (props.$active ? "#ffffff" : "#444444")};
  border: 1px solid ${(props) => (props.$active ? "#111111" : "#e4e4e7")};
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13.5px;
  font-weight: ${(props) => (props.$active ? "600" : "500")};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: ${(props) => (props.$active ? "#222222" : "#e4e4e7")};
    color: ${(props) => (props.$active ? "#ffffff" : "#111111")};
  }
`;
