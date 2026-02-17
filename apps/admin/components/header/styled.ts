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
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.3s ease;
`;

export const InnerHeaderwrapper = styled.div`
  /* max-width: 1200px; */
  width: 75%;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
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
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none; // Simplified for now, could add a hamburger menu
  }
`;

export const LinkTag = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textSecondary};
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
    background: ${({ theme }) => theme.colors.primary};
    transition: width 0.3s ease;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.dark};
    &::after {
      width: 100%;
    }
  }
`;

export const LoginSignupContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const AuthButton = styled(Link)<{ $variant?: "primary" | "secondary" }>`
  padding: 8px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s ease;

  ${({ $variant, theme }) =>
    $variant === "primary"
      ? `
    background: ${theme.colors.primary};
    color: ${theme.colors.dark};
    &:hover {
      background: ${theme.colors.primaryHover};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px ${theme.colors.shadow};
    }
  `
      : `
    background: transparent;
    color: ${theme.colors.dark};
    &:hover {
      color: ${theme.colors.primary};
    }
  `}
`;

export const PersonLogo = styled(Image)`
  width: 40px;
  height: 40px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
  }
`;
