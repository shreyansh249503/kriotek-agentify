import { BREAKPOINTS, COLOR } from "@/styles";
import styled from "styled-components";

export const GlassPanel = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${COLOR.BORDER}88;
  border-radius: 24px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.03),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  padding: 28px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 22px;
    border-radius: 18px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 16px;
    border-radius: 14px;
  }
`;

export const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
    border-color: #d1d5db;
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 20px;
    border-radius: 14px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 16px;
    border-radius: 12px;
  }
`;

export const StatCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const StatIconBox = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${COLOR.LIGHT};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
`;

export const StatLabel = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
  line-height: 1.2;
`;

export const StatValue = styled.p`
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
  line-height: 1.1;
  letter-spacing: -0.5px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 28px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 24px;
  }
`;

export const StatDeltaPill = styled.div<{ $up?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 8px;
  background-color: ${({ $up = true }) => ($up ? "#f2f9ed" : "#fef2f2")};
  color: ${({ $up = true }) => ($up ? "#558b2f" : "#ef4444")};
  font-size: 13px;
  font-weight: 600;
  width: fit-content;
  line-height: 1;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

export const StatDelta = StatDeltaPill;
