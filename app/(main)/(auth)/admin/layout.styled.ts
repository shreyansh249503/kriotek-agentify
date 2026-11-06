"use client";

import styled from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

export const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: ${COLOR.LIGHT};
`;

export const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const ContentWrapper = styled.div`
  flex: 1;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 0;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 0;
  }
`;
                                                                                                                                                                                                                                                                                                                     