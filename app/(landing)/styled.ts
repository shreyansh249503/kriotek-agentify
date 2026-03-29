import styled, { keyframes } from "styled-components";
import Link from "next/link";
import { COLOR } from "@/styles";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-20px) translateX(10px); }
  100% { transform: translateY(0px) translateX(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.6; }
  100% { transform: scale(1); opacity: 0.3; }
`;

const orbit = keyframes`
  from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
`;

const stream = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { transform: translateY(100vh); opacity: 0; }
`;

const blink = keyframes`
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.6; }
`;

export const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLOR.LIGHT};
  background-image:
    radial-gradient(
      at 0% 0%,
      ${COLOR.CREAM} 0,
      transparent 50%
    ),
    radial-gradient(
      at 100% 0%,
      ${COLOR.BACKGROUND} 0,
      transparent 50%
    );
  position: relative;
  overflow: hidden;
  padding-top: 80px;

  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A8E10C' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.4;
    z-index: 1;
  }
`;

export const AnimatedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
`;

export const AINode = styled.div<{
  $delay?: string;
  $size?: string;
  $top?: string;
  $left?: string;
}>`
  position: absolute;
  top: ${({ $top }) => $top || "20%"};
  left: ${({ $left }) => $left || "20%"};
  width: ${({ $size }) => $size || "120px"};
  height: ${({ $size }) => $size || "120px"};
  background: radial-gradient(circle, #a8e10ccd 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(20px);
  animation:
    ${float} 6s ease-in-out infinite,
    ${pulse} 4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
  z-index: 0;
`;

export const AICircle = styled.div<{
  $delay?: string;
  $size?: string;
  $top?: string;
  $left?: string;
}>`
  position: absolute;
  top: ${({ $top }) => $top || "50%"};
  left: ${({ $left }) => $left || "50%"};
  width: ${({ $size }) => $size || "200px"};
  height: ${({ $size }) => $size || "200px"};
  /* border: 2px solid rgba(168, 225, 12, 0.3); */
  border-radius: 50%;
  animation: ${orbit} 20s linear infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
  z-index: 0;

  &::after {
    content: "";
    position: absolute;
    top: -6px;
    left: 50%;
    width: 12px;
    height: 12px;
    background: ${COLOR.PRIMARY};
    border-radius: 50%;
    box-shadow:
      0 0 20px ${COLOR.PRIMARY},
      0 0 40px ${COLOR.PRIMARY};
  }
`;

export const FloatingParticle = styled.div<{
  $delay?: string;
  $top?: string;
  $left?: string;
}>`
  position: absolute;
  top: ${({ $top }) => $top || "10%"};
  left: ${({ $left }) => $left || "10%"};
  width: 6px;
  height: 6px;
  background: ${COLOR.PRIMARY};
  border-radius: 50%;
  opacity: 0.6;
  box-shadow: 0 0 15px ${COLOR.PRIMARY};
  animation: ${float} 10s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
  z-index: 1;
`;

export const DataStream = styled.div<{
  $left?: string;
  $delay?: string;
  $speed?: string;
}>`
  position: absolute;
  top: 0;
  left: ${({ $left }) => $left || "10%"};
  width: 2.5px;
  height: 180px;
  background: linear-gradient(
    to bottom,
    transparent,
    ${COLOR.PRIMARY},
    transparent
  );
  opacity: 0;
  animation: ${stream} ${({ $speed }) => $speed || "8s"} linear infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
  z-index: 0;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: -2px;
    width: 7px;
    height: 7px;
    background: ${COLOR.PRIMARY};
    border-radius: 50%;
    box-shadow: 0 0 20px ${COLOR.PRIMARY};
  }
`;

export const GridBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(168, 225, 12, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168, 225, 12, 0.2) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(circle at center, black, transparent 80%);
  animation: ${blink} 4s ease-in-out infinite;
  z-index: 0;
`;

export const NeuralLine = styled.div<{
  $top?: string;
  $left?: string;
  $width?: string;
  $rotate?: string;
  $delay?: string;
}>`
  position: absolute;
  top: ${({ $top }) => $top || "20%"};
  left: ${({ $left }) => $left || "20%"};
  width: ${({ $width }) => $width || "150px"};
  height: 2.5px;
  background: linear-gradient(
    90deg,
    ${COLOR.PRIMARY} 0%,
    transparent 70%
  );
  opacity: 0.4;
  transform: rotate(${({ $rotate }) => $rotate || "0deg"});
  transform-origin: left center;
  animation: ${pulse} 3s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: -2.5px;
    width: 7px;
    height: 7px;
    background: ${COLOR.PRIMARY};
    border-radius: 50%;
    box-shadow: 0 0 15px ${COLOR.PRIMARY};
  }
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 10;
  max-width: 1200px;
  padding: 0 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
`;

export const MainHeading = styled.h1`
  font-size: 72px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: ${COLOR.DARK};
  margin: 0;
  animation: ${fadeIn} 0.8s ease-out;

  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

export const SubHeading = styled.p`
  font-size: 20px;
  color: ${COLOR.TEXT_SECONDARY};
  max-width: 600px;
  line-height: 1.6;
  margin: 0;
  animation: ${fadeIn} 0.8s ease-out 0.2s backwards;
`;

export const CTAContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  animation: ${fadeIn} 0.8s ease-out 0.4s backwards;

  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
  }
`;

export const PrimaryButton = styled(Link)`
  padding: 16px 32px;
  background: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  font-weight: 700;
  border-radius: 9999px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px ${COLOR.SHADOW};

  &:hover {
    background: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(168, 225, 12, 0.4);
  }
`;

export const SecondaryButton = styled(Link)`
  padding: 16px 32px;
  background: white;
  color: ${COLOR.DARK};
  font-weight: 700;
  border-radius: 9999px;
  text-decoration: none;
  border: 2px solid ${COLOR.BORDER};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY};
    background: ${COLOR.LIGHT};
    transform: translateY(-2px);
  }
`;

export const FeaturesSection = styled.section`
  padding: 120px 24px;
  background: ${COLOR.WHITE};
  position: relative;
`;

export const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const SectionTitle = styled.h2`
  font-size: 42px;
  font-weight: 800;
  color: ${COLOR.DARK};
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
`;

export const SectionSubtitle = styled.p`
  font-size: 18px;
  color: ${COLOR.TEXT_SECONDARY};
  text-align: center;
  max-width: 600px;
  margin: 0 auto 80px;
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
`;

export const FeatureCard = styled.div`
  padding: 40px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 24px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px ${COLOR.SHADOW};

  &:hover {
    transform: translateY(-8px);
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.1);
  }
`;

export const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  background-color: ${COLOR.BACKGROUND_2};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: ${COLOR.PRIMARY}; // Or dark green
  margin-bottom: 24px;
`;

export const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin-bottom: 12px;
`;

export const FeatureDescription = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
  margin: 0;
`;

export const BenefitsSection = styled.section`
  padding: 120px 24px;
  background: ${COLOR.LIGHT};
`;

export const BenefitsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 64px;
  margin-top: 64px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

export const BenefitItem = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
`;

export const BenefitNumber = styled.span`
  font-size: 64px;
  font-weight: 800;
  color: ${COLOR.BORDER}; // Subtle number
  line-height: 1;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
`;

export const BenefitContent = styled.div`
  padding-top: 12px;
`;

export const BenefitTitle = styled.h4`
  font-size: 24px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin-bottom: 12px;
`;

export const BenefitDescription = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
  margin: 0;
`;

export const FinalCTA = styled.section`
  padding: 120px 24px;
  background: ${COLOR.DARK};
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(
      circle,
      rgba(168, 225, 12, 0.1) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
`;

export const CTATitle = styled.h2`
  font-size: 48px;
  font-weight: 800;
  color: ${COLOR.WHITE};
  margin-bottom: 24px;
  letter-spacing: -0.02em;
  position: relative;
`;

export const CTADescription = styled.p`
  font-size: 20px;
  color: ${COLOR.LIGHT};
  max-width: 600px;
  margin: 0 auto 48px;
  position: relative;
  opacity: 0.9;
`;
