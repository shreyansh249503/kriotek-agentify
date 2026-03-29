"use client";

import styled from "styled-components";
import { COLOR } from "@/styles";

export const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${COLOR.LIGHT};
`;

export const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const ContentWrapper = styled.div`
  flex: 1;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;
