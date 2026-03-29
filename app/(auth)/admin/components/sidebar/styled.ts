"use client";

import styled from "styled-components";
import Link from "next/link";
import { COLOR, BREAKPOINTS } from "@/styles";
import Image from "next/image";

export const SidebarContainer = styled.aside<{ $isCollapsed?: boolean }>`
  width: ${(props) => (props.$isCollapsed ? "100px" : "280px")};
  height: 100vh;
  background-color: ${COLOR.DARK};
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

export const LogoImage = styled(Image)<{ $isCollapsed?: boolean }>`
  width: ${(props) => (props.$isCollapsed ? "40px" : "160px")};
  height: ${(props) => (props.$isCollapsed ? "40px" : "50px ")};
  object-fit: contain;
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
  color: ${(props) => (props.$active ? COLOR.DARK : COLOR.WHITE)};
  background-color: ${(props) =>
    props.$active ? COLOR.PRIMARY : "transparent"};
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s ease;
  justify-content: center;

  span {
    flex: 1;
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
