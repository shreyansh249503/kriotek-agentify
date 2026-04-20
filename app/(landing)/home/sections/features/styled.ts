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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

