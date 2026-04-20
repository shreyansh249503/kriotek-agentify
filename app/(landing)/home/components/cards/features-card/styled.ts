import styled from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

export const FeatureCard = styled.div`
  padding: 40px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 24px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px ${COLOR.SHADOW};

  &:hover {
    transform: translateY(-8px);
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 30px;
  }
`;

export const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  background-color: ${COLOR.BACKGROUND_2};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: ${COLOR.PRIMARY};
  margin-bottom: 24px;
`;

export const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin-bottom: 12px;
`;

export const FeatureDescription = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
  margin: 0;
`;
