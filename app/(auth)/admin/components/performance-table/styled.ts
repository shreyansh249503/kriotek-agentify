import { COLOR } from "@/styles";
import Link from "next/link";
import styled from "styled-components";

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

export const PerformanceTableSubWrapper = styled.table`
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
    border-bottom: 1px solid ${COLOR.BORDER}90;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: rgba(0, 0, 0, 0.005);
  }
`;
export const BotTableInitialContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
export const BotName = styled.span`
  font-weight: 600;
  color: #1e293b;
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
export const BotEngagementVolume = styled.div`
  display: flex;
  flex-direction: column;
`;
export const BotEngagementChatText = styled.span`
  font-weight: 500;
  color: ${COLOR.PRIMARY_HOVER};
`;
export const BotEngagementVolumeText = styled.span`
  font-size: 12px;
  color: ${COLOR.TEXT_SECONDARY};
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
        return `background: #f7fee7; color: #65a30d; border: 1px solid #d4e8c1;`;
      case "warning":
        return `background: #fffbeb; color: #d97706;`;
      case "info":
        return `background: #eff6ff; color: #2563eb;`;
      case "primary":
      default:
        return `background: #fffbeb; color: #d97706;`;
    }
  }}
`;
export const BotROIContainer = styled.div`
  width: 100px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
export const BotROIValue = styled.div`
  font-size: 11px;
  font-weight: 600;
`;
export const BotROIBar = styled.div`
  height: 6px;
  width: 100%;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
`;
export const BotListLink = styled(Link)`
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: ${COLOR.DARK};
  text-decoration: none;
  padding: 6px 14px;
  background: white;
  border: 1px solid ${COLOR.BORDER};
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY};
    color: ${COLOR.PRIMARY_HOVER};
  }
`;
