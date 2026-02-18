"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

export const HeaderContainer = styled.header`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${COLOR.WHITE};
  box-shadow: 0 4px 12px ${COLOR.SHADOW};
  position: sticky;
  top: 0;
  z-index: 9999;
`;

export const InnerHeaderwrapper = styled.div`
  width: 75%;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 16px;
    flex-direction: column;
    gap: 16px;
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

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
`;

export const GoToHomeButton = styled(Link)`
  padding: 8px 24px;
  background-color: ${COLOR.WHITE};
  border-radius: 999px;
  text-decoration: none;
  border: 2px solid ${COLOR.PRIMARY};
  font-size: 15px;
  font-weight: 600;
  color: ${COLOR.PRIMARY};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${COLOR.PRIMARY};
    color: ${COLOR.WHITE};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${COLOR.SHADOW};
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 100%;
    text-align: center;
  }
`;
