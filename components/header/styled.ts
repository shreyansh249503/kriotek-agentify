import { BREAKPOINTS, COLOR } from "@/styles";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

export const HeaderContainer = styled.header`
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid ${COLOR.BORDER};
  transition: all 0.3s ease;
`;

export const InnerHeaderwrapper = styled.div`
  width: 75%;
  margin: 0 auto;
  padding: 8px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 90%;
    padding: 16px 0px;
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
    display: none; 
  }
`;

export const LinkTag = styled(Link)`
  width: fit-content;
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

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding-right: 20px ;
  }
`;

export const LoginSignupContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    display: none;
  }
`;

export const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: ${COLOR.DARK};
  padding: 8px;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 99999;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    display: flex;
  }

  &:hover {
    color: ${COLOR.PRIMARY};
    transform: scale(1.1);
  }
`;

export const DrawerOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition: all 0.4s ease;
`;

export const DrawerContent = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  background: ${COLOR.WHITE};
  z-index: 1001;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "100%")});
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 480px) {
    width: 85%;
  }
`;

export const DrawerLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 0px 20px ;
  }
`;

export const DrawerAuth = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const AuthButton = styled(Link) <{ $variant?: "primary" | "secondary" }>`
width: fit-content;
  padding: 8px 20px;
  border-radius: 10px;
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

export const DashboardButton = styled.p`
  width: fit-content;
  text-decoration: none;
  color: ${COLOR.TEXT_SECONDARY};
  font-weight: 500;
  font-size: 15px;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer ;

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

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding-right: 20px ;
  }
`;