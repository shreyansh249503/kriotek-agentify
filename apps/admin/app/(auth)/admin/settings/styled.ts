"use client";

import styled from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";
import { GlassPanel } from "../styled";

export const SettingsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: ${COLOR.LIGHT};
  padding: 40px;
  min-height: 100%;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 24px 16px;
  }
`;

export const DashboardWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const SettingsHeader = styled.div`
  margin-bottom: 8px;
`;

export const SettingsTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin: 0;
  letter-spacing: -1px;
`;

export const SettingsSubtitle = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 8px 0 0;
  opacity: 0.8;
`;

export const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: 1fr;
  }
`;

export const SidebarNav = styled(GlassPanel)`
  padding: 16px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const NavItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  background: ${({ $active }) =>
    $active ? `${COLOR.PRIMARY}12` : "transparent"};
  color: ${({ $active }) =>
    $active ? COLOR.PRIMARY_HOVER : COLOR.TEXT_SECONDARY};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;

  &:hover {
    background: ${({ $active }) =>
      $active ? `${COLOR.PRIMARY}18` : `${COLOR.BORDER}33`};
    color: ${({ $active }) => ($active ? COLOR.PRIMARY_HOVER : COLOR.DARK)};
  }
`;

export const SettingsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const SettingsSection = styled(GlassPanel)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid ${COLOR.BORDER}44;
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const SettingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SettingLabel = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${COLOR.DARK};
`;

export const SettingDescription = styled.p`
  font-size: 13px;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 0;
  opacity: 0.8;
`;

export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${COLOR.BORDER}88;
    transition: 0.4s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  input:checked + span {
    background-color: ${COLOR.PRIMARY};
  }

  input:checked + span:before {
    transform: translateX(24px);
  }
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ $danger }) => ($danger ? "#fee2e2" : COLOR.BORDER)};
  background: ${({ $danger }) => ($danger ? "#fff" : "white")};
  color: ${({ $danger }) => ($danger ? "#dc2626" : COLOR.TEXT_SECONDARY)};

  &:hover {
    background: ${({ $danger }) => ($danger ? "#fef2f2" : COLOR.LIGHT)};
    border-color: ${({ $danger }) => ($danger ? "#ef4444" : COLOR.PRIMARY)};
    color: ${({ $danger }) => ($danger ? "#b91c1c" : COLOR.PRIMARY_HOVER)};
    transform: translateY(-1px);
  }
`;

export const DangerZone = styled(SettingsSection)`
  border: 1px solid #fee2e2;
  background: #fffcfc;

  ${SectionTitle} {
    color: #dc2626;
  }
`;
