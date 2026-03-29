import { BREAKPOINTS, COLOR } from "@/styles";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

export const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid ${COLOR.BORDER};
  transition: all 0.3s ease;
`;

export const InnerHeaderwrapper = styled.div`
  /* max-width: 1200px; */
  width: 75%;
  margin: 0 auto;
  padding: 8px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 8px 16px;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

export const Logo = styled(Image)`
  width: auto;
  height: 50px;
  object-fit: contain;
`;

export const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 32px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    display: none; // Simplified for now, could add a hamburger menu
  }
`;

export const LinkTag = styled(Link)`
  text-decoration: none;
  color: ${COLOR.TEXT_SECONDARY};
  font-weight: 500;
  font-size: 15px;
  transition: all 0.2s ease;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${COLOR.PRIMARY};
    transition: width 0.3s ease;
  }

  &:hover {
    color: ${COLOR.DARK};
    &::after {
      width: 100%;
    }
  }
`;

export const LoginSignupContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const AuthButton = styled(Link)<{ $variant?: "primary" | "secondary" }>`
  padding: 8px 20px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s ease;

  ${({ $variant }) =>
    $variant === "primary"
      ? `
    background: ${COLOR.PRIMARY};
    color: ${COLOR.DARK};
    &:hover {
      background: ${COLOR.PRIMARY_HOVER};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px ${COLOR.SHADOW};
    }
  `
      : `
    background: transparent;
    color: ${COLOR.DARK};
    &:hover {
      color: ${COLOR.PRIMARY};
    }
  `}
`;

export const PersonLogo = styled(Image)`
  width: 40px;
  height: 40px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid ${COLOR.BORDER};
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY};
    transform: scale(1.05);
  }
`;
