"use client";

import styled from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";
import { GlassPanel } from "../styled";

export const BillingContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${COLOR.LIGHT};
  padding: 24px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 20px 16px;
  }
`;

export const BillingWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
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
`;

export const CurrentPlanCard = styled(GlassPanel)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-top: 4px solid ${COLOR.PRIMARY};

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const PlanInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const PlanName = styled.h3`
  font-size: 24px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin: 0;
  letter-spacing: -0.5px;
`;

export const PlanStatus = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 99px;
  width: fit-content;
  ${({ $status }) => {
    switch ($status) {
      case "active":
      case "trialing":
        return `background: #ecfdf5; color: #059669;`;
      case "past_due":
        return `background: #fffbeb; color: #d97706;`;
      default:
        return `background: #f3f4f6; color: #6b7280;`;
    }
  }}
`;

export const PeriodNote = styled.p`
  font-size: 13px;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 0;
`;

export const ManageButton = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid ${COLOR.BORDER};
  background: white;
  color: ${COLOR.DARK};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: ${COLOR.PRIMARY};
    color: ${COLOR.PRIMARY_HOVER};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const UsageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: 1fr;
  }
`;

export const UsageCard = styled(GlassPanel)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 24px;
`;

export const UsageLabel = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: ${COLOR.TEXT_SECONDARY};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 0;
`;

export const UsageValue = styled.p`
  font-size: 28px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin: 0;
  letter-spacing: -1px;
  line-height: 1;
`;

export const UsageLimit = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${COLOR.TEXT_SECONDARY};
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${COLOR.BORDER};
  border-radius: 99px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $pct: number; $warn: boolean }>`
  height: 100%;
  width: ${({ $pct }) => Math.min($pct, 100)}%;
  background: ${({ $warn }) => ($warn ? "#f59e0b" : COLOR.PRIMARY)};
  border-radius: 99px;
  transition: width 0.4s ease;
`;

export const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: ${BREAKPOINTS.DESKTOP}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
  }
`;

export const PlanCard = styled(GlassPanel)<{ $current: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border: 1px solid ${({ $current }) => ($current ? COLOR.PRIMARY : `${COLOR.BORDER}88`)};
  background: ${({ $current }) => ($current ? COLOR.BACKGROUND_2 : "rgba(255,255,255,0.8)")};
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY};
    transform: translateY(-2px);
  }
`;

export const CurrentBadge = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  font-size: 11px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 99px;
  white-space: nowrap;
`;

export const PlanCardName = styled.h4`
  font-size: 16px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin: 0;
`;

export const PlanPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

export const PlanPriceAmount = styled.span`
  font-size: 32px;
  font-weight: 800;
  color: ${COLOR.DARK};
  letter-spacing: -1px;
`;

export const PlanPricePer = styled.span`
  font-size: 13px;
  color: ${COLOR.TEXT_SECONDARY};
`;

export const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PlanFeature = styled.li`
  font-size: 13px;
  color: ${COLOR.TEXT_SECONDARY};
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "✓";
    color: ${COLOR.PRIMARY_HOVER};
    font-weight: 800;
    flex-shrink: 0;
  }
`;

export const UpgradeButton = styled.button<{ $current: boolean }>`
  margin-top: auto;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: ${({ $current }) => ($current ? COLOR.BORDER : COLOR.PRIMARY)};
  color: ${({ $current }) => ($current ? COLOR.TEXT_SECONDARY : COLOR.DARK)};
  font-size: 14px;
  font-weight: 700;
  cursor: ${({ $current }) => ($current ? "default" : "pointer")};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${COLOR.PRIMARY_HOVER};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
