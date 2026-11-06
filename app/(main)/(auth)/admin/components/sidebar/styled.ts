"use client";

import styled from "styled-components";
import Link from "next/link";
import { COLOR, BREAKPOINTS } from "@/styles";
import Image from "next/image";

export const SidebarContainer = styled.aside<{ $isCollapsed?: boolean }>`
  width: ${(props) => (props.$isCollapsed ? "100px" : "280px")};
  height: 100vh;
  background-color: #131415;
  color: ${COLOR.WHITE};
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding: ${(props) => (props.$isCollapsed ? "32px 16px" : "32px 24px")};
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 80px;
    padding: 32px 16px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    display: none;
  }
`;

export const LogoSection = styled.div<{ $isCollapsed?: boolean }>`
  display: flex;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "start")};
  align-items: center;
  gap: 12px;
  cursor: pointer;
  min-height: 48px;
`;

export const LogoImage = styled(Image)<{ $isCollapsed?: boolean; $type?: "full" | "short" }>`
  width: ${(props) => (props.$isCollapsed ? "40px" : "160px")};
  height: ${(props) => (props.$isCollapsed ? "40px" : "50px")};
  object-fit: contain;
  transition: all 0.3s ease;
  display: ${(props) => {
    if (props.$type === "short") return props.$isCollapsed ? "block" : "none";
    return props.$isCollapsed ? "none" : "block";
  }};

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    ${LogoSection} & {
      width: 40px;
      height: 40px;
      display: ${(props) => (props.$type === "short" ? "block" : "none")};
    }
  }
`;

export const LogoText = styled.span`
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  white-space: nowrap;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    display: none;
  }
`;

export const NavSection = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: ${(props) => (props.$active ? COLOR.WHITE : COLOR.WHITE)};
  background-color: ${(props) => (props.$active ? "#27282C" : "transparent")};
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s ease;
  justify-content: center;

  span {
    flex: 1;
    white-space: nowrap;
  }

  &:hover {
    background-color: ${(props) => (props.$active ? "#27282C" : "#27282C")};
    color: ${(props) => (props.$active ? COLOR.WHITE : COLOR.WHITE)};

    svg {
      color: ${COLOR.PRIMARY};
    }
  }

  svg {
    font-size: 22px;
    flex-shrink: 0;
    color: ${(props) => (props.$active ? COLOR.PRIMARY : "inherit")};
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 12px;

    span {
      display: none;
    }
  }
`;
export const LogoutButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: ${(props) => (props.$active ? COLOR.DARK : COLOR.WHITE)};
  background-color: ${(props) =>
    props.$active ? COLOR.PRIMARY : "transparent"};
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s ease;
  justify-content: center;

  span {
    flex: 1;
    text-align: left;
    white-space: nowrap;
  }

  &:hover {
    background-color: ${(props) =>
      props.$active ? COLOR.PRIMARY : "rgba(255, 255, 255, 0.05)"};
    transform: ${(props) => (props.$active ? "none" : "translateX(4px)")};
  }

  svg {
    font-size: 22px;
    flex-shrink: 0;
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 12px;

    span {
      display: none;
    }
  }
`;

export const BottomSection = styled.div`
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
`;

export const LogoutButtonContainer = styled.div`
  @media (max-width: ${BREAKPOINTS.TABLET}) {
    display: flex;
    justify-content: center;

    button {
      padding: 12px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        display: none;
      }
    }
  }
`;

/* ── Mobile Drawer ── */

export const DrawerOverlay = styled.div<{ $open: boolean }>`
  display: none;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1099;
    background: rgba(0, 0, 0, ${({ $open }) => ($open ? "0.5" : "0")});
    pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
    transition: background 0.3s ease;
  }
`;

export const DrawerContainer = styled.aside<{ $open: boolean }>`
  display: none;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    max-width: 80vw;
    height: 100vh;
    background-color: ${COLOR.DARK};
    color: ${COLOR.WHITE};
    padding: 24px 20px;
    z-index: 1100;
    transform: translateX(${({ $open }) => ($open ? "0" : "-100%")});
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${({ $open }) =>
      $open ? "4px 0 24px rgba(0, 0, 0, 0.25)" : "none"};
  }
`;

export const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
`;

export const DrawerCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  color: ${COLOR.WHITE};
  width: 36px;
  height: 36px;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }
`;

export const DrawerNavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: ${(props) => (props.$active ? COLOR.DARK : COLOR.WHITE)};
  background-color: ${(props) =>
    props.$active ? COLOR.PRIMARY : "transparent"};
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.$active ? COLOR.PRIMARY : "rgba(255, 255, 255, 0.05)"};
  }

  svg {
    font-size: 22px;
    flex-shrink: 0;
    color: ${(props) => (props.$active ? COLOR.PRIMARY : "inherit")};
  }
`;

export const DrawerLogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background-color: transparent;
  color: ${COLOR.WHITE};
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  svg {
    font-size: 22px;
    flex-shrink: 0;
  }
`;

export const UserProfileWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const UserProfileTrigger = styled.div<{ $isCollapsed?: boolean; $isOpen?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${(props) => (props.$isCollapsed ? "8px" : "10px 12px")};
  border-radius: 12px;
  cursor: pointer;
  background-color: ${(props) => (props.$isOpen ? "#27282C" : "transparent")};
  transition: all 0.2s ease;
  user-select: none;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};

  &:hover {
    background-color: #27282C;
  }
`;

export const AvatarCircle = styled.div<{ $size?: string }>`
  width: ${(props) => props.$size || "40px"};
  height: ${(props) => props.$size || "40px"};
  border-radius: 50%;
  background: linear-gradient(135deg, #9333EA 0%, #A855F7 100%);
  color: ${COLOR.WHITE};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: ${(props) => (props.$size === "36px" ? "13px" : "14px")};
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
`;

export const UserProfileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  flex: 1;
`;

export const UserProfileName = styled.span`
  color: ${COLOR.WHITE};
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

export const UserProfileEmail = styled.span`
  color: #9CA3AF;
  font-weight: 400;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

export const PopoverCard = styled.div<{ $isCollapsed?: boolean }>`
  position: absolute;
  bottom: calc(100% + 12px);
  left: 0;
  width: 270px;
  background-color: #27282C;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1050;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: popoverFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes popoverFadeIn {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 240px;
  }
`;

export const PopoverHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 4px 8px 4px;
`;

export const PopoverDivider = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 2px 0;
`;

export const PopoverMenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const PopoverMenuItem = styled.div<{ $isDanger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: ${(props) => (props.$isDanger ? COLOR.WHITE : COLOR.WHITE)};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  svg {
    font-size: 18px;
    flex-shrink: 0;
    color: ${(props) =>
      props.$isDanger ? COLOR.WHITE : "rgba(255, 255, 255, 0.7)"};
    transition: color 0.15s ease;
  }

  &:hover {
    background-color: ${(props) =>
      props.$isDanger
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.08)"};

    svg {
      color: ${(props) => (props.$isDanger ? COLOR.WHITE : COLOR.WHITE)};
    }
  }
`;

