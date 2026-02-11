import styled from "styled-components";

export const HeroSection = styled.section`
  min-height: 95vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 20% 50%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    );
  }
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  padding: 40px 20px;
  text-align: center;
  animation: fadeInUp 0.8s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const MainHeading = styled.h1`
  font-size: 64px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 24px;
  line-height: 1.2;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

export const SubHeading = styled.p`
  font-size: 24px;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 48px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

export const CTAContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

export const PrimaryButton = styled.button`
  padding: 16px 40px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: #ffffff;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

export const SecondaryButton = styled.button`
  padding: 16px 40px;
  font-size: 18px;
  font-weight: 600;
  border: 2px solid #ffffff;
  border-radius: 12px;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

export const FeaturesSection = styled.section`
  padding: 100px 20px;
  background: #ffffff;
`;

export const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const SectionTitle = styled.h2`
  font-size: 48px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

export const SectionSubtitle = styled.p`
  font-size: 20px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 64px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-top: 48px;
`;

export const FeatureCard = styled.div`
  padding: 40px 32px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: #4f46e5;
  }
`;

export const FeatureIcon = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 24px;
  font-size: 32px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
`;

export const FeatureTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
`;

export const FeatureDescription = styled.p`
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
`;

export const BenefitsSection = styled.section`
  padding: 100px 20px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
`;

export const BenefitsList = styled.div`
  display: grid;
  gap: 32px;
  margin-top: 48px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
`;

export const BenefitItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 32px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    transform: translateX(8px);
  }
`;

export const BenefitNumber = styled.div`
  min-width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 50%;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`;

export const BenefitContent = styled.div`
  flex: 1;
`;

export const BenefitTitle = styled.h4`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
`;

export const BenefitDescription = styled.p`
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
`;

export const FinalCTA = styled.section`
  padding: 100px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  text-align: center;
`;

export const CTATitle = styled.h2`
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

export const CTADescription = styled.p`
  font-size: 20px;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;
