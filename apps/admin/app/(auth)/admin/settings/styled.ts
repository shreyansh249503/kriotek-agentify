"use client";

import styled from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

export const SettingsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: ${COLOR.LIGHT};
  padding: 40px;
  min-height: 100%;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 24px 16px;
  }
`;

export const DashboardWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;
