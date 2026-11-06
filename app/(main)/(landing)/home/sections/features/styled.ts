import styled from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

export const FeaturesSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 24px;
  background: ${COLOR.WHITE};
  position: relative;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 80px 20px;
  }
`;

export const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 60px;
  max-width: 1200px;
`;

export const SectionContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

export const SectionTitle = styled.h2`
  font-size: 42px;
  font-weight: 800;
  color: ${COLOR.DARK};
  text-align: center;
  letter-spacing: -0.02em;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 32px;
  }
`;

export const SectionSubtitle = styled.p`
  font-size: 18px;
  color: ${COLOR.TEXT_SECONDARY};
  text-align: center;
  max-width: 600px;
`;

export const FeaturesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
  width: 100%;

  & > * {
    flex: 1 1 300px;
    max-width: 360px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    gap: 20px;
    & > * {
      flex: 1 1 100%;
      max-width: 100%;
    }
  }
`;

