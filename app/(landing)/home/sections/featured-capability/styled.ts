"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Image from "next/image";
import styled from "styled-components";

export const FeaturedCapabilityMainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f8f8;
  padding: 100px 0px;
  gap: 60px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 60px 0px;
    gap: 40px;
  }
`;

export const FeaturedCapabilitySectionHeader = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 90%;
    text-align: center;
  }
`;

export const FeaturedCapabilityTitleBtn = styled.div`
  width: fit-content;
  padding: 10px 18px;
  background-color: ${COLOR.WHITE};
  border-radius: 24px;
  border: 1px solid ${COLOR.BORDER};
  font-size: 15px;
  font-weight: 500;
  color: ${COLOR.PRIMARY_HOVER};
`;

export const FeaturedCapabilityHeading = styled.h2`
  font-size: 38px;
  font-weight: 600;
  color: ${COLOR.DARK};
  line-height: 1.2;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 32px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 26px;
  }
`;

export const FeaturedCapabilityDescription = styled.p`
  max-width: 65%;
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  text-align: center;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    max-width: 100%;
  }
`;

export const FeaturedCapabilitySectionConatiner = styled.div`
  width: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 90%;
    gap: 20px;
  }
`;

export const FeaturedCapabilityCardImage = styled(Image)`
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 20px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 100%;
    max-width: 300px;
    height: auto;
    aspect-ratio: 1;
  }
`;

export const FeaturedCapabilityCardContainer = styled.div`
  width: 300px;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  border-radius: 20px;
  background-color: ${COLOR.WHITE};
  border: 1px solid #e1e1e1;
  padding: 30px 18px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 100%;
    max-width: 300px;
    height: auto;
    min-height: 250px;
    gap: 16px;
  }
`;

export const FeaturedCapabilityCardTitle = styled.h3`
  font-size: 26px;
  font-weight: 500;
  line-height: 1.2;
  color: ${COLOR.DARK};
`;

export const FeaturedCapabilityCardDescription = styled.p`
  font-size: 13.5px;
  color: ${COLOR.TEXT_SECONDARY};
  font-weight: 450;
`;

export const FeaturedCapabilityPrimarySection = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
`;

export const FeaturedCapabilitySecondarySection = styled.div`
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;
