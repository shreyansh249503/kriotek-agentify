"use client";

import { COLOR } from "@/styles";
import styled from "styled-components";

export const Badge = styled.span<{ $status: "active" | "inactive" }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${({ $status }) =>
    $status === "active"
      ? `
    background-color: rgba(168, 225, 12, 0.2);
    color: ${COLOR.DARK};
  `
      : `
    background-color: ${COLOR.LIGHT};
    color: ${COLOR.TEXT_SECONDARY};
  `}
`;
