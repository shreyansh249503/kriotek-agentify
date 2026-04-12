"use client";

import styled, { keyframes, css } from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";
import { GlassPanel } from "../styled";

export const PageContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${COLOR.LIGHT};
  padding: 24px;
  gap: 24px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 20px 16px;
  }
`;

/* ── Stepper ──────────────────────────────────────────────────────────────── */

export const Stepper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0;
`;

export const StepItem = styled.div<{ $state: "done" | "active" | "idle" }>`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

export const StepCircle = styled.div<{ $state: "done" | "active" | "idle" }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  transition: all 0.3s ease;

  ${({ $state }) => {
    if ($state === "done")
      return `background: ${COLOR.PRIMARY}; color: ${COLOR.DARK};`;
    if ($state === "active")
      return `background: ${COLOR.DARK}; color: ${COLOR.PRIMARY}; box-shadow: 0 0 0 4px ${COLOR.BACKGROUND_2};`;
    return `background: ${COLOR.BORDER}; color: ${COLOR.TEXT_SECONDARY};`;
  }}
`;

export const StepLabel = styled.div<{ $state: "done" | "active" | "idle" }>`
  display: flex;
  flex-direction: column;
  gap: 2px;

  span:first-child {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: ${({ $state }) =>
      $state === "idle" ? COLOR.TEXT_SECONDARY : COLOR.DARK};
  }

  span:last-child {
    font-size: 13px;
    font-weight: 600;
    color: ${({ $state }) =>
      $state === "active" ? COLOR.DARK : COLOR.TEXT_SECONDARY};
  }
`;

export const StepConnector = styled.div<{ $done: boolean }>`
  flex: 1;
  height: 2px;
  background: ${({ $done }) => ($done ? COLOR.PRIMARY : COLOR.BORDER)};
  margin: 0 8px;
  transition: background 0.3s ease;
  min-width: 24px;
`;

/* ── Step cards ───────────────────────────────────────────────────────────── */

export const StepCard = styled(GlassPanel)<{ $active: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-top: 3px solid ${({ $active }) => ($active ? COLOR.PRIMARY : COLOR.BORDER)};
  opacity: ${({ $active }) => ($active ? 1 : 0.6)};
  pointer-events: ${({ $active }) => ($active ? "auto" : "none")};
  transition: all 0.3s ease;
`;

export const StepCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StepTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StepBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  background: ${COLOR.BACKGROUND_2};
  color: ${COLOR.PRIMARY_HOVER};
  border: 1px solid ${COLOR.BORDER};
  padding: 3px 10px;
  border-radius: 99px;
`;

/* ── Form elements ────────────────────────────────────────────────────────── */

export const Label = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: ${COLOR.TEXT_SECONDARY};
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${COLOR.BORDER};
  background: white;
  font-size: 14px;
  color: ${COLOR.DARK};
  resize: vertical;
  min-height: 90px;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY};
  }

  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY};
    opacity: 0.6;
  }
`;

export const HelperText = styled.p`
  font-size: 12px;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 0;
  opacity: 0.8;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export const ActionButton = styled.button<{ $loading?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 12px;
  border: none;
  background: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover:not(:disabled) {
    background: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  ${({ $loading }) =>
    $loading &&
    css`
      svg.spin {
        animation: ${spin} 0.8s linear infinite;
      }
    `}
`;

/* ── Result previews ──────────────────────────────────────────────────────── */

export const ResultRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    flex-direction: column;
  }
`;

export const AvatarPreview = styled.img`
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 16px;
  border: 2px solid ${COLOR.BORDER};
  flex-shrink: 0;
`;

export const AudioPlayer = styled.audio`
  width: 100%;
  margin-top: 4px;
`;

export const VideoPlayer = styled.video`
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
  border: 2px solid ${COLOR.BORDER};
`;

export const SuccessBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 4px 12px;
  border-radius: 99px;
`;

export const ErrorBanner = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  font-size: 13px;
  font-weight: 500;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* ── Voice selector ───────────────────────────────────────────────────────── */

export const GenderToggle = styled.div`
  display: flex;
  gap: 8px;
`;

export const GenderButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 9px 0;
  border-radius: 10px;
  border: 2px solid ${({ $active }) => ($active ? COLOR.PRIMARY : COLOR.BORDER)};
  background: ${({ $active }) => ($active ? COLOR.PRIMARY : "white")};
  color: ${({ $active }) => ($active ? COLOR.DARK : COLOR.TEXT_SECONDARY)};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY};
  }
`;

export const VoiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const VoiceCard = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 2px solid ${({ $active }) => ($active ? COLOR.PRIMARY : COLOR.BORDER)};
  background: ${({ $active }) => ($active ? "#fffbeb" : "white")};
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY};
    background: #fffbeb;
  }
`;

export const VoiceName = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${COLOR.DARK};
`;

export const VoiceAccent = styled.span`
  font-size: 11px;
  color: ${COLOR.TEXT_SECONDARY};
`;

/* ── Saved avatars gallery ────────────────────────────────────────────────── */

export const SavedSection = styled(GlassPanel)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SavedSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const SavedSectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SavedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
`;

export const SavedAvatarCard = styled.button<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
  border-radius: 14px;
  border: 2px solid ${({ $selected }) => ($selected ? COLOR.PRIMARY : COLOR.BORDER)};
  background: ${({ $selected }) => ($selected ? "#fffbeb" : "white")};
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: ${COLOR.PRIMARY};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

export const SavedAvatarThumb = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

export const SavedAvatarMeta = styled.div`
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const SavedAvatarName = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${COLOR.DARK};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SavedAvatarDate = styled.span`
  font-size: 10px;
  color: ${COLOR.TEXT_SECONDARY};
`;

export const SavedAvatarActions = styled.div`
  display: flex;
  gap: 6px;
  padding: 0 10px 10px;
`;

export const SmallButton = styled.button<{ $danger?: boolean }>`
  flex: 1;
  padding: 5px 0;
  border-radius: 8px;
  border: 1px solid ${({ $danger }) => ($danger ? "#fca5a5" : COLOR.BORDER)};
  background: ${({ $danger }) => ($danger ? "#fff1f1" : "white")};
  color: ${({ $danger }) => ($danger ? "#dc2626" : COLOR.DARK)};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $danger }) => ($danger ? "#fee2e2" : COLOR.BACKGROUND_2)};
    border-color: ${({ $danger }) => ($danger ? "#ef4444" : COLOR.PRIMARY)};
  }
`;

export const SaveButton = styled.button<{ $saved?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 10px;
  border: 1px solid ${({ $saved }) => ($saved ? "#a7f3d0" : COLOR.BORDER)};
  background: ${({ $saved }) => ($saved ? "#ecfdf5" : "white")};
  color: ${({ $saved }) => ($saved ? "#059669" : COLOR.DARK)};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;

  svg.spin {
    animation: ${spin} 0.8s linear infinite;
  }

  &:hover:not(:disabled) {
    border-color: ${COLOR.PRIMARY};
    background: ${COLOR.BACKGROUND_2};
    color: ${COLOR.DARK};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
