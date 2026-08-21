import styled from "styled-components";
import Image from "next/image";

export const BannerSectionContainer = styled.section`
  width: 85%;
  margin: 60px auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: center;

  @media (max-width: 1024px) {
    width: 90%;
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

export const FlashSaleBannerCard = styled.div`
  position: relative;
  width: 100%;
  min-height: 280px;
  border-radius: 24px;
  background: linear-gradient(135deg, #ff5314 0%, #ff7328 50%, #ff934b 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(255, 83, 20, 0.25);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 28px 24px;
    gap: 20px;
  }
`;

export const BannerInnerImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
`;

export const DarkBannerCard = styled.div`
  position: relative;
  width: 100%;
  min-height: 280px;
  border-radius: 24px;
  background: linear-gradient(135deg, #0a0a0c 0%, #16171b 50%, #202228 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200%;
    background: linear-gradient(
      135deg,
      transparent 40%,
      rgba(255, 83, 20, 0.15) 50%,
      transparent 60%
    );
    transform: rotate(-30deg);
    pointer-events: none;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 28px 24px;
    gap: 20px;
  }
`;

export const BannerContent = styled.div`
  position: absolute;
  top: 20%;
  left: 5%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 2;
  max-width: 55%;

  @media (max-width: 640px) {
    max-width: 100%;
  }
`;

export const BannerSubtitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  opacity: 0.9;
  letter-spacing: 0.02em;
`;

export const BannerTitle = styled.h2`
  font-size: 34px;
  font-weight: 600;
  color: #ffffff;
  margin: 6px 0 16px 0;
  line-height: 1.15;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

export const BannerDescription = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #ffffff;
  opacity: 0.85;
  margin: 0 0 24px 0;
  line-height: 1.45;
`;

export const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
`;

export const TimerDigitsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.05em;
`;

export const TimerLabelsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  opacity: 0.85;
  padding-left: 2px;
`;

export const BannerButton = styled.button<{ $textColor?: string }>`
  background: #ffffff;
  color: ${(props) => props.$textColor || "#ff5314"};
  font-size: 14px;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  }
`;

export const BannerVisualWrapper = styled.div`
  position: absolute;
  right: -20px;
  top: 0;
  bottom: 0;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  @media (max-width: 640px) {
    position: relative;
    right: 0;
    width: 100%;
    height: 200px;
  }
`;

export const BannerShoeImage = styled(Image)`
  width: 100%;
  height: 80%;
  object-fit: contain;
  object-position: center;
`;

export const BannerVisualWrapper2 = styled.div`
  position: absolute;
  right: -20px;
  bottom: 0;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  @media (max-width: 640px) {
    position: relative;
    right: 0;
    width: 100%;
    height: 200px;
  }
`;

export const BannerImage = styled(Image)`
  width: 100%;
  height: 300px;
  object-fit: contain;
  object-position: center;
`;
