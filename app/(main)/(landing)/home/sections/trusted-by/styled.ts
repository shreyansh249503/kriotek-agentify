"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Image from "next/image";
import styled from "styled-components";

export const TrustedByContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 10px;
`;
export const TrustedByTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: ${COLOR.DARK};
  text-align: center;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 14px;
    padding: 0 16px;
  }
`;

export const TrustedByImageContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    justify-content: center;
    gap: 30px;
  }
`;

export const TrustedByImage = styled(Image)`
  width: auto;
  height: auto;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.6;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    max-height: 30px;
  }
`;
