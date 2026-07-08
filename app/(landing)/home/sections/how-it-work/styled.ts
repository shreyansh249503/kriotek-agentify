"use client";

import { COLOR } from "@/styles";
import styled from "styled-components";

export const HowItWorkMainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 110px 0px;
`;

export const HowItWorkHeaderSection = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

export const HowItWorkHeading = styled.h2`
  font-size: 38px;
  font-weight: 600;
  color: ${COLOR.DARK};
  line-height: 1.2;
`;

export const HowItWorkDescription = styled.p`
  max-width: 65%;
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  text-align: center;
`;

export const HowItWorkSectionConatiner = styled.div`
  width: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
`;