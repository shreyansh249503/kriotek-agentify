"use client";

import { COLOR } from "@/styles";
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
`;

export const TrustedByImageContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: 20px;
`;

export const TrustedByImage = styled(Image)`
  width: auto;
  height: auto;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.6;
`;
