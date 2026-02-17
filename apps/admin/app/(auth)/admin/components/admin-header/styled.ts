"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

export const HeaderContainer = styled.header`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  position: sticky;
  top: 0;
  z-index: 9999;
`;

export const InnerHeaderwrapper = styled.div`
  width: 75%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.md};
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
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
  gap: ${({ theme }) => theme.spacing.md};
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.dark};
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 24px;
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    width: 100%;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const GoToHomeButton = styled(Link)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  text-decoration: none;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${({ theme }) => theme.colors.shadow};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
    text-align: center;
  }
`;
