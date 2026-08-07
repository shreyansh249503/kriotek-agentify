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
  gap: 16px;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 16px;
  }
`;

export const ChartHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

export const LegendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 12px;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
`;

export const LegendBadge = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${({ $color }) => $color};
  display: inline-block;
`;

export const TimeframeSelect = styled.select`
  appearance: none;
  background-color: #f4fbf0;
  border: 1px solid #d9f99d;
  color: #65a30d;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 30px 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2365a30d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ecfccb;
  }
`;

export const ChartWrapper = styled.div`
  width: 100%;
  height: 280px;
  margin-top: 10px;
`;
