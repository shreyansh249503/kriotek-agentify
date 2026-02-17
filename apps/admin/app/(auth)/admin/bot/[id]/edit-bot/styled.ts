"use client";

import styled from "styled-components";

export const NewBotContainer = styled.div`
  width: 100%;
  min-height: 85vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  /* background-color: ${({ theme }) => theme.colors.primaryHover}; */
`;

export const NewBotWrapper = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 8px 24px ${({ theme }) => theme.colors.shadow};
  background-color: ${({ theme }) => theme.colors.white};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.xl};
    max-width: 100%;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

export const NewBotTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.dark};
  text-align: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 28px;
  }
`;
