"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import { createGlobalStyle, keyframes, styled } from "styled-components";
import CardImage from "@/assets/images/bot-card.jpg";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const GlobalBotsStyle = createGlobalStyle`
  .spin {
    animation: ${spin} 0.7s linear infinite;
  }
`;

export const BotsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 18px;
  background: linear-gradient(135deg, ${COLOR.LIGHT} 0%, ${COLOR.CREAM} 100%);
  min-height: 90vh;
  padding: 24px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 24px 16px;
  }
`;

export const AgentsEmptyContainer = styled(BotsContainer)`
  justify-content: center;
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
  border-radius: 16px;
  border: 1px solid ${COLOR.BORDER}66;
  overflow: hidden;
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
    background: ${COLOR.BORDER}88;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${COLOR.PRIMARY}44;
  }

  scrollbar-width: thin;
  scrollbar-color: ${COLOR.BORDER}88 transparent;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 600px;
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
`;

export const BotName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${COLOR.DARK};
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const BotIconWrapper = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
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
  gap: 12px;
  justify-content: center;
  align-items: center;
`;

export const EditBotButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 18px;
  background-color: ${COLOR.WHITE};
  border-radius: 999px;
  text-align: center;
  border: 2px solid ${COLOR.BORDER};
  font-size: 13px;
  font-weight: 700;
  color: ${COLOR.TEXT};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: ${COLOR.PRIMARY};
    background-color: ${COLOR.PRIMARY}11;
    color: ${COLOR.DARK};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const AgentsContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const EmptyBotsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  width: 100%;
  text-align: center;
`;

export const EmptyBannerCard = styled.div`
  width: 540px;
  max-width: 100%;
  height: 270px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background-image: url(${typeof CardImage === "string" ? CardImage : CardImage.src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 20px 0 28px;
  margin-bottom: 28px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 100%;
    height: 175px;
    padding: 0 14px 0 18px;
  }
`;

export const EmptyLogoCircle = styled.div`
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${COLOR.WHITE};
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  border: 2px solid ${COLOR.WHITE};
  margin-bottom: 100px;
  margin-left: 30px;
  flex-shrink: 0;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 62px;
    height: 62px;
    margin-bottom: 24px;
  }
`;

export const EmptyMiniChatWindow = styled.div`
  width: 250px;
  height: 200px;
  background-color: ${COLOR.WHITE};
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  box-shadow: 0 -2px 14px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 160px;
    height: 135px;
  }
`;

export const EmptyMiniChatHeader = styled.div`
  height: 36px;
  background-color: #000000;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
`;

export const EmptyMiniAvatar = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${COLOR.WHITE};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const EmptyMiniChatTitle = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${COLOR.WHITE};
`;

export const EmptyMiniChatBody = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const EmptyMiniBotBubble = styled.div`
  height: 18px;
  width: 65%;
  background-color: #e5e7eb;
  border-radius: 4px;
`;

export const EmptyMiniUserBubble = styled.div`
  height: 18px;
  width: 75%;
  background-color: #000000;
  border-radius: 4px;
  align-self: flex-end;
  margin-top: 4px;
`;

export const EmptyMiniBotResponseBubble = styled.div`
  height: 45px;
  width: 70%;
  background-color: #e5e7eb;
  border-radius: 6px;
  margin-top: 4px;
`;

export const EmptyTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 10px 0;
`;

export const EmptyDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  max-width: 460px;
  line-height: 1.5;
  margin: 0 0 28px 0;
`;

export const EmptyNewAgentButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${COLOR.DARK};
  color: #ffffff;
  padding: 11px 22px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    background-color: #222222ff;
  }

  &:active {
    transform: translateY(0);
  }
`;
