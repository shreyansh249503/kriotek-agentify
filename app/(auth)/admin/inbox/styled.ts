"use client";

import styled from "styled-components";
import { COLOR, BREAKPOINTS } from "@/styles";

export const InboxContainer = styled.div`
  display: flex;
  width: 100%;
  height: calc(100vh - 120px);
  background-color: ${COLOR.WHITE};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid ${COLOR.BORDER};

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    flex-direction: column;
    height: calc(100vh - 160px);
  }
`;

export const SidebarPanel = styled.div`
  width: 350px;
  border-right: 1px solid ${COLOR.BORDER};
  display: flex;
  flex-direction: column;
  background-color: ${COLOR.LIGHT};
  flex-shrink: 0;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 100%;
    height: 35%;
    border-right: none;
    border-bottom: 1px solid ${COLOR.BORDER};
  }
`;

export const SidebarHeader = styled.div`
  padding: 16px 20px;
  background-color: ${COLOR.WHITE};
  border-bottom: 1px solid ${COLOR.BORDER};
  font-weight: 700;
  font-size: 16px;
  color: ${COLOR.TEXT};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ConversationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ConvoItem = styled.div<{ $active: boolean }>`
  padding: 12px 16px;
  border-radius: 10px;
  background-color: ${props => props.$active ? COLOR.CREAM : COLOR.WHITE};
  border: 1px solid ${props => props.$active ? COLOR.PRIMARY : "transparent"};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &:hover {
    background-color: ${props => props.$active ? COLOR.CREAM : `${COLOR.BORDER}33`};
    transform: translateY(-1px);
  }
`;

export const ConvoMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ConvoName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${COLOR.TEXT};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ConvoDate = styled.div`
  font-size: 11px;
  color: ${COLOR.TEXT_SECONDARY};
  flex-shrink: 0;
`;

export const ConvoSnippet = styled.div`
  font-size: 12.5px;
  color: ${COLOR.TEXT_SECONDARY};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ConvoBotBadge = styled.span`
  align-self: flex-start;
  font-size: 10px;
  background-color: ${COLOR.PRIMARY}15;
  color: ${COLOR.PRIMARY_HOVER};
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  margin-top: 2px;
`;

export const ConvoStatusBadge = styled.span<{ $status?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;

  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #d97706;
  }
`;


export const ChatPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${COLOR.WHITE};

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    height: 65%;
  }
`;

export const ChatHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${COLOR.BORDER};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${COLOR.WHITE};
`;

export const ChatHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const ChatHeaderName = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: ${COLOR.TEXT};
`;

export const ChatHeaderMeta = styled.div`
  font-size: 12px;
  color: ${COLOR.TEXT_SECONDARY};
  display: flex;
  gap: 8px;
`;

export const ChatHeaderActions = styled.div`
  display: flex;
  align-items: center;
`;

export const CloseButton = styled.button`
  background-color: ${COLOR.DARK};
  color: ${COLOR.WHITE};
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background-color: ${COLOR.LIGHT}33;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const MessageRow = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${props => props.$isOwn ? "flex-end" : "flex-start"};
  width: 100%;
`;

export const MessageBubble = styled.div<{ $isOwn: boolean }>`
  max-width: 65%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  ${props => props.$isOwn ? `
    background-color: ${COLOR.PRIMARY};
    color: ${COLOR.WHITE};
    border-bottom-right-radius: 2px;
  ` : `
    background-color: ${COLOR.WHITE};
    color: ${COLOR.TEXT};
    border-bottom-left-radius: 2px;
    border: 1px solid ${COLOR.BORDER};
  `}
`;

export const MessageText = styled.p`
  margin: 0;
`;

export const SystemMessage = styled.div`
  align-self: center;
  background-color: ${COLOR.CREAM};
  color: ${COLOR.TEXT_SECONDARY};
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-style: italic;
  margin: 8px 0;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
`;

export const InputArea = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${COLOR.BORDER};
  background-color: ${COLOR.WHITE};
`;

export const InputForm = styled.form`
  display: flex;
  gap: 12px;
`;

export const InputField = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${COLOR.BORDER};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${COLOR.PRIMARY};
  }
`;

export const SendButton = styled.button`
  background-color: ${COLOR.PRIMARY};
  color: ${COLOR.WHITE};
  border: none;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${COLOR.PRIMARY_HOVER};
  }

  &:disabled {
    background-color: ${COLOR.BORDER};
    cursor: not-allowed;
  }
`;

export const EmptyStateContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
  color: ${COLOR.TEXT_SECONDARY};
  background-color: ${COLOR.LIGHT}11;
  gap: 16px;
`;

export const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${COLOR.TEXT};
  margin: 0;
`;

export const EmptyStateDesc = styled.p`
  font-size: 14px;
  margin: 0;
  max-width: 320px;
  line-height: 1.5;
`;
