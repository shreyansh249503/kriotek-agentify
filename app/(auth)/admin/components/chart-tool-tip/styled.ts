"use client";

import { COLOR } from "@/styles";
import styled from "styled-components";

export const TooltipContainer = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid ${COLOR.BORDER}66;
  border-radius: 16px;
  padding: 12px 16px;
  font-size: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
`;

export const TooltipLabel = styled.p`
  margin: 0 0 8px;
  font-weight: 700;
  color: ${COLOR.DARK};
`;

export const TooltipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0;
`;

export const Indicator = styled.div<{ $fill?: string; $name?: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $fill, $name }) =>
    $fill || ($name === "Engagement" ? COLOR.PRIMARY : COLOR.DARK)};
  box-shadow: ${({ $fill }) => ($fill ? `0 0 8px ${$fill}44` : "none")};
`;

export const ValueName = styled.span`
  color: ${COLOR.TEXT_SECONDARY};
  font-weight: 500;
`;

export const ValueText = styled.span`
  margin-left: auto;
  font-weight: 700;
  color: ${COLOR.DARK};
`;
