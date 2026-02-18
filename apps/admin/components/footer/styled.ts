import styled from "styled-components";
import Link from "next/link";
import { COLOR } from "@/styles";
import { BREAKPOINTS } from "@/styles";

export const FooterContainer = styled.footer`
  background-color: ${COLOR.DARK};
  color: ${COLOR.WHITE};
  padding: 48px 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      ${COLOR.PRIMARY},
      transparent
    );
    opacity: 0.3;
  }
`;

export const FooterContent = styled.div`
  /* max-width: 1200px; */
  width: 75%;
  margin: 0 auto;
`;

export const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
  }
`;

export const FooterBrand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FooterTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  color: ${COLOR.WHITE};
  margin-bottom: 16px;
`;

export const BrandDescription = styled.p`
  font-size: 14px;
  color: #a0a0a0;
  line-height: 1.6;
  max-width: 280px;
`;

export const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FooterLink = styled(Link)`
  font-size: 14px;
  color: #a0a0a0;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    color: ${COLOR.PRIMARY};
    transform: translateX(4px);
  }
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

export const SocialIcon = styled.a`
  color: #a0a0a0;
  font-size: 20px;
  transition: all 0.3s ease;

  &:hover {
    color: ${COLOR.PRIMARY};
    transform: translateY(-3px);
  }
`;

export const CopyrightSection = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: column;
    text-align: center;
  }
`;

export const CopyrightText = styled.span`
  font-size: 14px;
  color: #666;
`;

export const LegalLinks = styled.div`
  display: flex;
  gap: 24px;
`;
