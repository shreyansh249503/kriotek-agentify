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
    border-bottom: 1px solid ${COLOR.BORDER}33;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: rgba(0, 0, 0, 0.005);
  }
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
