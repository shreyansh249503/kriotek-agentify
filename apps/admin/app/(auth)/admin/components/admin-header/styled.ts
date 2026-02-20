"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Link from "next/link";
import styled from "styled-components";

export const HeaderContainer = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  background-color: ${COLOR.WHITE};
  border-bottom: 1px solid ${COLOR.BORDER};
  position: sticky;
  top: 0;
  z-index: 900;
  height: 80px;
`;

export const InnerHeaderwrapper = styled.div`
  width: 100%;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 0 24px;
  }
`;

export const PageTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${COLOR.DARK};
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
