"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import styled from "styled-components";

export const LogoutBtn = styled.button`
  padding: 8px 24px;
  background-color: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${COLOR.SHADOW};
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 100%;
  }
`;
