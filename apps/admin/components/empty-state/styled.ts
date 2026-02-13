"use client";

import styled from "styled-components";

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl}
    ${({ theme }) => theme.spacing.lg};
  text-align: center;
  min-height: 400px;
`;

export const EmptyIcon = styled.div`
  font-size: 64px;
  color: ${({ theme }) => theme.colors.primary};
  opacity: 0.5;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const EmptyTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const EmptyDescription = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
`;

export const EmptyActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(168, 225, 12, 0.3);

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(168, 225, 12, 0.4);
  }
`;
