import styled, { keyframes } from "styled-components";
import Link from "next/link";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.light};
  background-image:
    radial-gradient(
      at 0% 0%,
      ${({ theme }) => theme.colors.cream} 0,
      transparent 50%
    ),
    radial-gradient(
      at 100% 0%,
      ${({ theme }) => theme.colors.background} 0,
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
  color: ${({ theme }) => theme.colors.dark};
  margin: 0;
  animation: ${fadeIn} 0.8s ease-out;

  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

export const SubHeading = styled.p`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
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
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  font-weight: 700;
  border-radius: 9999px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(168, 225, 12, 0.4);
  }
`;

export const SecondaryButton = styled(Link)`
  padding: 16px 32px;
  background: white;
  color: ${({ theme }) => theme.colors.dark};
  font-weight: 700;
  border-radius: 9999px;
  text-decoration: none;
  border: 2px solid ${({ theme }) => theme.colors.border};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.light};
    transform: translateY(-2px);
  }
`;

export const FeaturesSection = styled.section`
  padding: 120px 24px;
  background: ${({ theme }) => theme.colors.white};
  position: relative;
`;

export const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const SectionTitle = styled.h2`
  font-size: 42px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.dark};
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
`;

export const SectionSubtitle = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
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
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 24px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px ${({ theme }) => theme.colors.shadow};

  &:hover {
    transform: translateY(-8px);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.1);
  }
`;

export const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  background: ${({ theme }) => theme.colors.cream};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary}; // Or dark green
  margin-bottom: 24px;
`;

export const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 12px;
`;

export const FeatureDescription = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

export const BenefitsSection = styled.section`
  padding: 120px 24px;
  background: ${({ theme }) => theme.colors.light};
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
  color: ${({ theme }) => theme.colors.border}; // Subtle number
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
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 12px;
`;

export const BenefitDescription = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

export const FinalCTA = styled.section`
  padding: 120px 24px;
  background: ${({ theme }) => theme.colors.dark};
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
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 24px;
  letter-spacing: -0.02em;
  position: relative;
`;

export const CTADescription = styled.p`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.light};
  max-width: 600px;
  margin: 0 auto 48px;
  position: relative;
  opacity: 0.9;
`;
