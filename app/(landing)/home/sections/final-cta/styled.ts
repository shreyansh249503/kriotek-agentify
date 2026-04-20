import styled from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

export const CTAWrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 60px;
  padding: 120px 24px;
  background: ${COLOR.DARK};
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(
      circle,
      rgba(168, 225, 12, 0.1) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
`;

export const CTATitle = styled.h2`
  font-size: 48px;
  font-weight: 800;
  color: ${COLOR.WHITE};
  letter-spacing: -0.02em;
  position: relative;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 32px;
  }
`;

export const CTADescription = styled.p`
  font-size: 20px;
  color: ${COLOR.LIGHT};
  max-width: 600px;
  position: relative;
  opacity: 0.9;
`;

export const CTAButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const NoCardWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #fafaf8;
`;
export const NoCardText = styled.p`
  font-size: 14px;
`;
