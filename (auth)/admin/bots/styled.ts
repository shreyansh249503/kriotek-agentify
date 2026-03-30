"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Link from "next/link";
import styled from "styled-components";

export const BotsContainer = styled.div`
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
export const LoadingContainer = styled(BotsContainer)`
  justify-content: center;
  align-items: center;
  min-height: 90vh;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.DESKTOP}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
  }
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

export const FilterSelect = styled.select`
  padding: 16px;
  padding-right: 32px;
  background-color: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 999px;
  font-size: 14px;
  color: ${COLOR.DARK};
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' style='fill: %232E2E2E;transform: ;msFilter:;'%3E%3Cpath d='M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 20px;
  min-width: 150px;

  &:focus {
    border-color: ${COLOR.PRIMARY};
  }
`;

export const TableContainer = styled.div`
  width: 100%;
  background-color: ${COLOR.WHITE}; 
  border-radius: 20px;
  border: 1px solid ${COLOR.PRIMARY};
  overflow: hidden;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    overflow-x: auto;
  }
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 600px;
`;

export const TableHead = styled.thead`
  /* background: rgba(250, 250, 250, 0.8); */
  background-color: ${COLOR.WHITE};
  border-bottom: 1px solid ${COLOR.BORDER};
`;

export const TableHeader = styled.th`
  padding: 16px 24px;
  font-size: 13px;
  font-weight: 600;
  color: ${COLOR.TEXT_SECONDARY};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

export const TableBody = styled.tbody`
  & > tr:not(:last-child) {
    border-bottom: 1px solid ${COLOR.BORDER}66;
  }
`;

export const TableRow = styled.tr`
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
`;

export const TableCell = styled.td`
  padding: 16px 24px;
  vertical-align: middle;
  color: ${COLOR.DARK};
`;

export const BotName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${COLOR.DARK};
`;

export const BotDescription = styled.div`
  font-size: 14px;
  color: ${COLOR.TEXT_SECONDARY};
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 400px;
`;

export const ActionCellWrapper = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
`;

export const IngestButton = styled(Link)`
  padding: 6px 16px;
  background-color: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  border-radius: 999px;
  text-decoration: none;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-2px);
    /* box-shadow: 0 4px 8px ${COLOR.SHADOW}; */
  }
`;

export const EditBotButton = styled(Link)`
  padding: 6px 16px;
  background-color: ${COLOR.WHITE};
  border-radius: 999px;
  text-decoration: none;
  text-align: center;
  border: 2px solid ${COLOR.PRIMARY};
  font-size: 14px;
  font-weight: 600;
  color: ${COLOR.PRIMARY};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${COLOR.PRIMARY};
    color: ${COLOR.DARK};
    transform: translateY(-2px);
    /* box-shadow: 0 4px 8px ${COLOR.SHADOW}; */
  }
`;
