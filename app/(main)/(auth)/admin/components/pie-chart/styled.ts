import styled from "styled-components";
import { BREAKPOINTS } from "@/styles";

export const ChartCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 100%;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 16px;
  }
`;

export const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

export const ChartBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 24px;
  flex: 1;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: column;
  }
`;

export const DonutWrapper = styled.div`
  width: 220px;
  height: 220px;
  position: relative;
  flex-shrink: 0;
`;

export const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  max-width: 240px;
`;

export const LegendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const LegendLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const LegendBadgeCircle = styled.span<{ $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  display: inline-block;
  flex-shrink: 0;
`;

export const LegendName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
`;

export const LegendValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
`;

export const ChartWrapper = styled.div`
  width: 100%;
  height: 220px;
`;
