"use client";

import { COLOR } from "@/styles";
import styled from "styled-components";

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  min-height: 400px;
`;

export const EmptyIcon = styled.div`
  font-size: 64px;
  color: ${COLOR.PRIMARY};
  opacity: 0.5;
  margin-bottom: 24px;
`;

export const EmptyTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin-bottom: 8px;
`;

export const EmptyDescription = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  max-width: 400px;
  margin-bottom: 32px;
  line-height: 1.6;
`;

export const EmptyActionButton = styled.button`
  padding: 16px 32px;
  background-color: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  border: none;
  border-radius: 999px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(168, 225, 12, 0.3);

  &:hover {
    background-color: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(168, 225, 12, 0.4);
  }
`;
