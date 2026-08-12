"use client";

import { COLOR, BREAKPOINTS } from "@/styles";
import styled, { keyframes } from "styled-components";
import CardImage from "@/assets/images/bot-card.jpg";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

export const CardWrapper = styled.div`
  background-color: ${COLOR.WHITE};
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;

  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
  }
`;

export const CardBanner = styled.div<{ $primaryColor?: string }>`
  position: relative;
  height: 175px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 16px 0 20px;
  overflow: hidden;
  background-image: url(${typeof CardImage === "string" ? CardImage : CardImage.src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

export const BannerLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 110px;
  margin-bottom: 22px;
  z-index: 2;
`;

export const LogoCircle = styled.div`
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background-color: ${COLOR.WHITE};
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  overflow: hidden;
  border: 2px solid ${COLOR.WHITE};
  flex-shrink: 0;
`;

export const LogoImg = styled.img`
  width: 80%;
  height: 80%;
  object-fit: contain;
`;

export const BotNameLabel = styled.span`
  font-weight: 700;
  font-size: 13.5px;
  color: ${COLOR.DARK};
  text-align: center;
  max-width: 105px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
`;

export const MiniChatWindow = styled.div`
  width: 180px;
  height: 140px;
  background-color: ${COLOR.WHITE};
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  box-shadow:
    0 -2px 14px rgba(0, 0, 0, 0.06),
    -2px 0 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 150px;
  }
`;

export const MiniChatHeader = styled.div<{ $color: string }>`
  background-color: ${({ $color }) => $color || "#111111"};
  color: ${COLOR.WHITE};
  padding: 7px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
`;

export const MiniAvatarCircle = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${COLOR.WHITE};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
`;

export const MiniLogoImg = styled.img`
  width: 75%;
  height: 75%;
  object-fit: contain;
`;

export const MiniChatTitle = styled.span`
  font-size: 10.5px;
  font-weight: 600;
  color: ${COLOR.WHITE};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MiniChatBody = styled.div`
  background-color: ${COLOR.WHITE};
  padding: 10px 10px 0 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;
`;

export const MiniBotBubble = styled.div`
  width: 65px;
  height: 15px;
  border-radius: 4px;
  background-color: #e5e7eb;
`;

export const MiniUserBubble = styled.div<{ $color: string }>`
  align-self: flex-end;
  width: 85px;
  height: 15px;
  border-radius: 4px;
  background-color: ${({ $color }) => $color || "#111111"};
`;

export const MiniBotResponseBubble = styled.div`
  width: 75px;
  height: 32px;
  border-radius: 4px;
  background-color: #e5e7eb;
`;

export const CardFooter = styled.div`
  padding: 16px 20px;
  background-color: ${COLOR.WHITE};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
`;

export const FooterLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
  padding-right: 12px;
`;

export const CompanyName = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${COLOR.DARK};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

export const TrainedTimeText = styled.span`
  font-size: 12px;
  color: ${COLOR.TEXT_SECONDARY};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MenuWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const MenuButton = styled.button`
  background-color: ${COLOR.WHITE};
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  line-height: 1;

  &:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
    color: ${COLOR.DARK};
  }

  &:focus-visible {
    outline: 2px solid ${COLOR.PRIMARY};
    outline-offset: 2px;
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  background-color: ${COLOR.WHITE};
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 6px;
  min-width: 140px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: ${fadeIn} 0.15s ease-out;
`;

export const DropdownItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $danger }) => ($danger ? "#DC2626" : COLOR.DARK)};
  cursor: pointer;
  transition: background-color 0.15s ease;
  text-align: left;

  &:hover {
    background-color: ${({ $danger }) => ($danger ? "#FEE2E2" : "#F3F4F6")};
  }

  &:focus-visible {
    outline: 2px solid ${COLOR.PRIMARY};
    outline-offset: 1px;
  }
`;

const modalPop = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

export const ModalCard = styled.div`
  background: ${COLOR.WHITE};
  border-radius: 16px;
  padding: 24px;
  max-width: 440px;
  width: 100%;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.15),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  position: relative;
  animation: ${modalPop} 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
`;

export const ModalIconWrapper = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background-color: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

export const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
`;

export const ModalDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 24px 0;
`;

export const ModalBotName = styled.span`
  font-weight: 600;
  color: #111827;
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
`;

export const ModalCancelButton = styled.button`
  padding: 9px 16px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: ${COLOR.WHITE};
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  &:focus-visible {
    outline: 2px solid ${COLOR.PRIMARY};
    outline-offset: 1px;
  }
`;

export const ModalDeleteButton = styled.button`
  padding: 9px 16px;
  border-radius: 8px;
  border: none;
  background: #dc2626;
  color: ${COLOR.WHITE};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: #b91c1c;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #dc2626;
    outline-offset: 2px;
  }
`;

export const ModalSpinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;
