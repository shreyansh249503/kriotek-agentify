"use client";

import styled from "styled-components";
import { COLOR } from "@/styles";

export const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${COLOR.CREAM};
`;

export const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; // Prevent content from overflowing flex parent
`;

export const ContentWrapper = styled.div`
  padding: 40px;
  flex: 1;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;
