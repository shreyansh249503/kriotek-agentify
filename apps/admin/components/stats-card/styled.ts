"use client";

import styled from "styled-components";

export const StatsCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid rgba(168, 225, 12, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

export const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(168, 225, 12, 0.15);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 24px;
`;

export const StatsValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.dark};
  line-height: 1;
`;

export const StatsLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ChangeIndicator = styled.span<{ $positive?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? "#10b981" : "#ef4444")};
  display: flex;
  align-items: center;
  gap: 4px;
`;
