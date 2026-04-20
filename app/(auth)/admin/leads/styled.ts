"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import styled from "styled-components";

export const LeadsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: linear-gradient(135deg, ${COLOR.LIGHT} 0%, ${COLOR.CREAM} 100%);
  min-height: 90vh;
  padding: 24px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 24px 16px;
  }
`;

export const LoadingContainer = styled(LeadsContainer)`
  justify-content: center;
  align-items: center;
  min-height: 90vh;
`;

export const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

export const TableContainer = styled.div`
  width: 100%;
  background-color: ${COLOR.WHITE};
  border-radius: 16px;
  border: 1px solid ${COLOR.BORDER}66;
  overflow: hidden;
  margin-top: 8px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    border-radius: 12px;
  }
`;

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 6px;
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${COLOR.BORDER};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${COLOR.PRIMARY};
  }

  scrollbar-width: thin;
  scrollbar-color: ${COLOR.BORDER}88 transparent;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 800px;
`;

export const TableHead = styled.thead`
  background-color: ${COLOR.DARK};
  border-bottom: 1px solid ${COLOR.BORDER}88;
`;

export const TableHeader = styled.th`
  padding: 20px 24px;
  font-size: 11px;
  font-weight: 700;
  color: ${COLOR.LIGHT};
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
`;

export const TableBody = styled.tbody`
  & > tr:not(:last-child) {
    border-bottom: 1px solid ${COLOR.BORDER}66;
  }
`;

export const TableRow = styled.tr`
  transition: all 0.2s ease;
  border-bottom: 1px solid ${COLOR.BORDER}33;

  &:hover {
    background-color: ${COLOR.PRIMARY}08;
  }
`;

export const TableCell = styled.td`
  padding: 16px 24px;
  vertical-align: middle;
  color: ${COLOR.DARK};
  white-space: nowrap;
`;

export const UserName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${COLOR.DARK};
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
`;

export const UserIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: ${COLOR.PRIMARY}15;
  color: ${COLOR.PRIMARY_HOVER};
`;

export const BotBadge = styled.span`
  padding: 4px 12px;
  background-color: ${COLOR.PRIMARY}22;
  color: ${COLOR.DARK};
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
`;

export const ContactInfo = styled.div`
  font-size: 14px;
  color: ${COLOR.TEXT_SECONDARY};
  white-space: nowrap;
`;

export const DateText = styled.div`
  font-size: 13px;
  color: ${COLOR.TEXT_SECONDARY};
  white-space: nowrap;
`;
