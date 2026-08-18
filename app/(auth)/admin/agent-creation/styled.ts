import styled from "styled-components";
import { COLOR, BREAKPOINTS } from "@/styles";
import Link from "next/link";
import Image from "next/image";

export const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  width: 100%;
  background-color: ${COLOR.WHITE};
`;

export const LeftHeroSection = styled.div`
  flex: 1;
  min-height: 100vh;
  background-color: #050505;
  background-image: radial-gradient(
    rgba(255, 255, 255, 0.22) 1.2px,
    transparent 1.2px
  );
  background-size: 24px 24px;
  background-position: 0 0;
  position: relative;

  @media (max-width: 960px) {
    display: none;
  }
`;

export const RightContentSection = styled.div`
  flex: 1.1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 64px 32px 64px;
  background-color: ${COLOR.WHITE};
  box-sizing: border-box;

  @media (max-width: ${BREAKPOINTS.DESKTOP}) {
    padding: 36px 40px 28px 40px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 24px 20px 20px 20px;
  }
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 24px;
`;

export const BrandContainer = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  cursor: pointer;
`;

export const BrandLogoImage = styled(Image)`
  width: 170px;
  height: 60px;
  object-fit: contain;
`;

export const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StepDot = styled.div<{ $active: boolean }>`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background-color: ${({ $active }) => ($active ? "#A8E10C" : "#E5E7EB")};
  transition:
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s ease;

  ${({ $active }) =>
    $active &&
    `
    transform: scale(1.08);
  `}
`;

export const MainContentArea = styled.div`
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px 0;
`;

export const StepTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #18181b;
  letter-spacing: -0.5px;
  line-height: 1.25;
  margin: 0 0 32px 0;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 26px;
    margin-bottom: 24px;
  }
`;

export const PillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
`;

export const OptionPill = styled.button<{ $isSelected: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid
    ${({ $isSelected }) => ($isSelected ? "#18181b" : "transparent")};
  background-color: ${({ $isSelected }) =>
    $isSelected ? "#18181b" : "#F4F4F5"};
  color: ${({ $isSelected }) => ($isSelected ? "#FFFFFF" : "#18181b")};
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background-color: ${({ $isSelected }) =>
      $isSelected ? "#27272a" : "#E4E4E7"};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SectionBlock = styled.div`
  margin-bottom: 28px;
`;

export const SectionLabel = styled.label`
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #18181b;
  margin-bottom: 10px;
`;

export const UrlInputGroup = styled.div`
  display: flex;
  align-items: stretch;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-within {
    border-color: #18181b;
    box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.08);
  }
`;

export const UrlPrefix = styled.span`
  padding: 12px 14px;
  background-color: #f4f4f5;
  color: #52525b;
  font-size: 14px;
  font-weight: 500;
  border-right: 1px solid #e4e4e7;
  display: flex;
  align-items: center;
  user-select: none;
`;

export const UrlInputField = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 14px;
  color: #18181b;
  background-color: transparent;

  &::placeholder {
    color: #a1a1aa;
  }
`;

export const InfoSubtext = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #71717a;
  margin-top: 8px;
  line-height: 1.4;

  svg {
    flex-shrink: 0;
  }
`;

export const OtherSourcesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

export const SourceCard = styled.button<{ $isSelected: boolean }>`
  padding: 16px 14px;
  border: 1px solid
    ${({ $isSelected }) => ($isSelected ? "#18181b" : "#e4e4e7")};
  border-radius: 10px;
  background-color: ${({ $isSelected }) =>
    $isSelected ? "#fafafa" : "#ffffff"};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 84px;
  text-align: left;
  width: 100%;

  ${({ $isSelected }) =>
    $isSelected &&
    `
    box-shadow: 0 0 0 2px #18181b;
  `}

  &:hover {
    border-color: #a1a1aa;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

export const SourceIconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: #f4f4f5;
  color: #18181b;
`;

export const SourceCardTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #18181b;
`;

export const SubSourceDrawer = styled.div`
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f9fafb;
  border: 1px solid #e4e4e7;
`;

export const SourceInputArea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #d4d4d8;
  font-size: 13.5px;
  color: #18181b;
  background-color: #ffffff;
  outline: none;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    border-color: #18181b;
    box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.08);
  }
`;

export const ActionButtonsRow = styled.div<{ $hasBack: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $hasBack }) =>
    $hasBack ? "space-between" : "flex-end"};
  gap: 16px;
  margin-top: 36px;
`;

export const BackButton = styled.button`
  padding: 12px 32px;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  background-color: #ffffff;
  color: #18181b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f4f4f5;
    border-color: #d4d4d8;
  }
`;

export const ContinueButton = styled.button<{ $fullWidth?: boolean }>`
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  min-width: 180px;
  padding: 14px 36px;
  border: none;
  border-radius: 8px;
  background-color: #18181b;
  color: #ffffff;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background-color: #27272a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const FooterRow = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  font-size: 13px;
  color: #71717a;
  width: 100%;
`;

export const FooterCopyright = styled.span`
  font-weight: 500;
`;

export const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const FooterLink = styled(Link)`
  color: #71717a;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: #18181b;
  }
`;
