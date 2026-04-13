"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Link from "next/link";
import styled from "styled-components";

export const HeaderWrapper = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  background-color: ${COLOR.WHITE};
  border-bottom: 1px solid ${COLOR.BORDER};
  position: sticky;
  top: 0;
  z-index: 900;
  height: 80px;
  padding: 20px 0;
`;
export const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
   gap: 2px;
`;

export const HeaderTitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
   gap: 1px;
`;

export const InnerHeaderwrapper = styled.div`
  width: 100%;
  padding: 0 40px 0px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 0 20px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 0 12px;
    gap: 8px;
  }
`;

export const PageTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${COLOR.DARK};

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 17px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 15px;
  }
`;

export const HeaderTitle = styled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 28px;
  font-weight: 700;
  color: ${COLOR.DARK};
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: ${COLOR.PRIMARY};
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 24px;
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    gap: 10px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    gap: 6px;
  }
`;

export const GoToHomeButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 24px;
  background-color: ${COLOR.WHITE};
  border-radius: 999px;
  text-decoration: none;
  border: 2px solid ${COLOR.PRIMARY};
  font-size: 15px;
  font-weight: 600;
  color: ${COLOR.PRIMARY};
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${COLOR.PRIMARY};
    color: ${COLOR.WHITE};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${COLOR.SHADOW};
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 6px 18px;
    font-size: 13px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 6px 14px;
    font-size: 12px;
  }
`;

export const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: ${COLOR.DARK};
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${COLOR.LIGHT};
    color: ${COLOR.PRIMARY};
  }

  svg {
    display: block;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    display: none;
  }
`;

export const HamburgerButton = styled.button`
  display: none;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: ${COLOR.DARK};
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      background-color: ${COLOR.LIGHT};
      color: ${COLOR.PRIMARY};
    }

    svg {
      display: block;
    }
  }
`;

export const HomeButtonText = styled.span`
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    display: none;
  }
`;

export const HomeButtonIcon = styled.span`
  display: none;
  align-items: center;
  justify-content: center;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    display: flex;
  }
`;
