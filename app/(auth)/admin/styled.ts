"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Link from "next/link";
import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: ${COLOR.LIGHT};
  padding: 24px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 20px 16px;
  }
`;
export const LoadingContainer = styled(Container)`
  justify-content: center;
  align-items: center;
  min-height: 80vh;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.DESKTOP}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
  }
`;

export const DashboardWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    gap: 24px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    gap: 18px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 13px;
  font-weight: 700;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    margin: 0 0 16px 0;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 12px;
    margin: 0 0 12px 0;
    gap: 6px;
  }
`;

export const EmptyChart = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLOR.TEXT_SECONDARY};
  font-size: 14px;
`;

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

export const StatCard = styled(GlassPanel)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: ${COLOR.BACKGROUND_2};
  /* background-color: ${COLOR.PRIMARY}; */
  border: 1px solid ${COLOR.PRIMARY};
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: radial-gradient(
      circle at bottom right,
      ${COLOR.PRIMARY}15,
      transparent 70%
    );
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
    border-color: ${COLOR.PRIMARY}88;
  }
`;

export const StatCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

export const StatIconBox = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${COLOR.LIGHT};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  box-shadow:
    0 4px 12px ${({ $color }) => $color}15,
    inset 0 0 0 1px ${COLOR.BORDER};
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  ${StatCard}:hover & {
    transform: scale(1.1) rotate(-8deg);
    /* background: ${COLOR.PRIMARY}15; */
    color: ${COLOR.PRIMARY_HOVER};
    box-shadow: 0 8px 16px ${COLOR.PRIMARY}22;
  }
`;

export const StatDelta = styled.span<{ $up?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  color: ${({ $up }) => ($up ? COLOR.DARK : COLOR.TEXT_SECONDARY)};
  background: ${({ $up }) => ($up ? "#f7fee7" : "#fef2f2")};
  padding: 4px 10px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const StatValue = styled.p`
  font-size: 34px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin: 0;
  line-height: 1;
  letter-spacing: -1.2px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 28px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 24px;
    letter-spacing: -0.8px;
  }
`;

export const StatLabel = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 0;
  opacity: 0.8;
`;

/* Panels */
export const PanelRow = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 1.2fr;
  gap: 24px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled(GlassPanel)`
  border: 1px solid ${COLOR.BORDER}44;
`;

export const ChartWrapper = styled.div`
  width: 100%;
  height: 260px;
  margin-top: 10px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    height: 220px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    height: 200px;
    margin-top: 6px;
  }
`;

export const BotListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid ${COLOR.BORDER}44;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.01);
  }
`;

export const BotListItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const BotInitial = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    ${COLOR.BACKGROUND_2} 0%,
    ${COLOR.LIGHT} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: ${COLOR.PRIMARY_HOVER};
  border: 1px solid ${COLOR.BORDER}44;
  flex-shrink: 0;
`;

export const BotListName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${COLOR.DARK};
  margin: 0;
`;

export const BotListDate = styled.p`
  font-size: 12px;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 2px 0 0;
  opacity: 0.7;
`;

export const BotListLink = styled(Link)`
  font-size: 12px;
  font-weight: 600;
  color: ${COLOR.DARK};
  text-decoration: none;
  padding: 6px 14px;
  background: white;
  border: 1px solid ${COLOR.BORDER};
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: ${COLOR.PRIMARY};
    color: ${COLOR.PRIMARY_HOVER};
    box-shadow: 0 4px 12px ${COLOR.SHADOW};
  }
`;

export const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

export const QuickActionCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid ${COLOR.BORDER}88;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: ${COLOR.PRIMARY};
    background: ${COLOR.CREAM}44;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
    transform: translateX(8px) translateY(-2px);
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 16px;
    gap: 14px;
    border-radius: 14px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 14px;
    gap: 12px;
    border-radius: 12px;
  }
`;

export const QuickActionIcon = styled.div<{ $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${({ $color }) => $color}12;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px ${({ $color }) => $color}15;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 38px;
    height: 38px;
    border-radius: 8px;
  }
`;

export const QuickActionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const QuickActionTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin: 0;
`;

export const QuickActionDesc = styled.p`
  font-size: 12px;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 0;
  opacity: 0.8;
`;

export const PerformanceTableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${COLOR.BORDER}66;
    border-radius: 10px;
  }
`;

export const PerformanceTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;

  th {
    text-align: left;
    padding: 12px 16px;
    font-weight: 700;
    font-size: 11px;
    color: ${COLOR.TEXT_SECONDARY};
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 2px solid ${COLOR.BORDER}33;
    white-space: nowrap;
  }

  td {
    padding: 16px;
    border-bottom: 1px solid ${COLOR.BORDER}33;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: rgba(0, 0, 0, 0.005);
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 13px;

    th {
      padding: 10px 12px;
      font-size: 10px;
    }

    td {
      padding: 12px;
    }
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 12px;

    th {
      padding: 8px 10px;
    }

    td {
      padding: 10px;
    }
  }
`;

export const Badge = styled.span<{
  $type?: "success" | "warning" | "info" | "primary";
}>`
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  ${({ $type }) => {
    switch ($type) {
      case "success":
        return `background: #ecfdf5; color: #059669;`;
      case "warning":
        return `background: #fffbeb; color: #d97706;`;
      case "info":
        return `background: #eff6ff; color: #2563eb;`;
      case "primary":
      default:
        return `background: #f7fee7; color: #65a30d; border: 1px solid #d4e8c1;`;
    }
  }}
`;
