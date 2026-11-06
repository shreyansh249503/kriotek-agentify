import { COLOR, BREAKPOINTS } from "@/styles";
import Link from "next/link";
import styled from "styled-components";
import { motion } from "framer-motion";

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

  thead th {
    text-align: left;
    padding: 12px 14px;
    font-weight: 600;
    font-size: 13px;
    color: #475569;
    border-bottom: 1px solid #f1f5f9;
    white-space: nowrap;

    &:first-child {
      padding-left: 0;
      width: 28%;
    }

    &:nth-child(2) {
      width: 20%;
    }

    &:nth-child(3) {
      width: 16%;
    }

    &:nth-child(4) {
      width: 22%;
    }

    &:last-child {
      text-align: right;
      padding-right: 0;
      width: 14%;
    }
  }

  tbody td {
    padding: 14px;
    border-bottom: 1px solid #f8fafc;
    vertical-align: middle;
    white-space: nowrap;

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      text-align: right;
      padding-right: 0;
    }
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr {
    transition: background-color 0.15s ease;
  }

  tbody tr:hover td {
    background: #fafafa;
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 13px;

    thead th {
      padding: 10px 10px;
      font-size: 12px;
    }

    tbody td {
      padding: 12px 10px;
    }
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 12px;

    thead th {
      padding: 8px 8px;
      font-size: 11px;
    }

    tbody td {
      padding: 10px 8px;
    }
  }
`;

export const AgentCell = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const AgentAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f3fae8;
  border: 1px solid #d9f2ba;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #84cc16;
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

  tr:hover & {
    transform: scale(1.06);
  }
`;

export const AgentName = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
`;

export const ChatsText = styled.span`
  font-weight: 500;
  color: #1e293b;
  font-size: 14px;
`;

export const LeadsText = styled.span`
  font-weight: 500;
  color: #1e293b;
  font-size: 14px;
`;

export const ConversionContainer = styled.div`
  width: 120px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ConversionRateText = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
`;

export const ConversionProgressBar = styled.div`
  height: 6px;
  width: 100%;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
`;

export const ConversionProgressFill = styled(motion.div)`
  height: 100%;
  background: #84cc16;
  border-radius: 999px;
`;

export const ManageButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 6px 20px;
  background: ${COLOR.DARK};
  color: ${COLOR.WHITE};
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: #1e1e1e;
    color: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY}66;
    box-shadow: 0 2px 10px ${COLOR.PRIMARY}20;

    .btn-text {
      transform: translateX(-7px);
    }

    .btn-icon {
      right: 10px;
      opacity: 1;
      color: ${COLOR.PRIMARY};
    }
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const ManageButtonText = styled.span.attrs({ className: "btn-text" })`
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const ManageButtonIcon = styled.span.attrs({ className: "btn-icon" })`
  position: absolute;
  right: -20px;
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: ${COLOR.PRIMARY};
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, color 0.3s ease;
`;

export const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${COLOR.TEXT_SECONDARY};
  font-size: 14px;
  font-weight: 500;
`;

export const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 18px;
  border-top: 1px solid #f1f5f9;
`;

export const PaginationButton = styled.button<{ $active?: boolean }>`
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? "#1e293b" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#475569")};
  border: 1px solid ${({ $active }) => ($active ? "#1e293b" : "#e2e8f0")};

  &:hover:not(:disabled) {
    border-color: #1e293b;
    color: ${({ $active }) => ($active ? "#ffffff" : "#1e293b")};
    background: ${({ $active }) => ($active ? "#1e293b" : "#f8fafc")};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const PaginationText = styled.span`
  font-size: 13px;
  color: #64748b;
  margin-right: auto;
  font-weight: 500;
`;
