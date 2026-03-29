"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import styled from "styled-components";

export const NewBotContainer = styled.div`
  width: 100%;
  min-height: 85vh;
  display: flex;
  align-items: center;
  padding: 24px;
`;

export const NewBotWrapper = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24px;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 8px 24px ${COLOR.SHADOW};
  background-color: ${COLOR.WHITE};

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 32px;
    max-width: 100%;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 24px;
  }
`;

export const NewBotTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: ${COLOR.DARK};
  text-align: center;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 28px;
  }
`;
