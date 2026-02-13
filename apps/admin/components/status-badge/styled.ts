"use client";

import styled from "styled-components";

export const Badge = styled.span<{ $status: "active" | "inactive" }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${({ $status, theme }) =>
    $status === "active"
      ? `
    background-color: rgba(168, 225, 12, 0.2);
    color: ${theme.colors.dark};
  `
      : `
    background-color: ${theme.colors.light};
    color: ${theme.colors.textSecondary};
  `}
`;
