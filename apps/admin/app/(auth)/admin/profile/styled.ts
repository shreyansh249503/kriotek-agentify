"use client";

import styled from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";
import { GlassPanel } from "../styled";

export const ProfileContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
`;

export const ProfileHeaderCard = styled(GlassPanel)`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  border-top: 4px solid ${COLOR.PRIMARY};

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: column;
    text-align: center;
    padding: 24px 20px;
  }
`;

export const AvatarSection = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${COLOR.PRIMARY}22, ${COLOR.PRIMARY}44);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLOR.PRIMARY};
  flex-shrink: 0;
  box-shadow: 0 8px 24px ${COLOR.PRIMARY}22;
  border: 4px solid #fff;
`;

export const AvatarInitials = styled.span`
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -1px;
`;

export const AvatarEditButton = styled.button`
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${COLOR.LIGHT};
  border: 1px solid ${COLOR.BORDER};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLOR.TEXT_SECONDARY};
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;

  &:hover {
    color: ${COLOR.PRIMARY};
    border-color: ${COLOR.PRIMARY};
    transform: scale(1.1);
  }
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
`;

export const ProfileName = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin: 0;
  letter-spacing: -0.5px;
`;

export const ProfileEmail = styled.p`
  font-size: 15px;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 0;
`;

export const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: ${COLOR.PRIMARY}15;
  color: ${COLOR.PRIMARY};
  border-radius: 99px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid ${COLOR.PRIMARY}33;
  width: fit-content;
  margin-top: 4px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    margin: 4px auto 0;
  }
`;

export const FormSection = styled(GlassPanel)`
  display: flex;
  flex-direction: column;
  background-color: ${COLOR.CREAM};
  border: 1px solid ${COLOR.PRIMARY};
  gap: 24px;
`;

export const FormSectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${COLOR.BORDER}66;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${COLOR.TEXT_SECONDARY};
  margin-left: 4px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${COLOR.BORDER};
  background: #ffffff;
  font-size: 15px;
  color: ${COLOR.DARK};
  transition: all 0.2s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px ${COLOR.PRIMARY}15;
  }

  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY}88;
  }

  &:disabled {
    background: ${COLOR.BACKGROUND_2};
    color: ${COLOR.TEXT_SECONDARY};
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${COLOR.BORDER};
  background: #ffffff;
  font-size: 15px;
  color: ${COLOR.DARK};
  transition: all 0.2s ease;
  font-family: inherit;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231a1a1a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 16px top 50%;
  background-size: 10px auto;

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px ${COLOR.PRIMARY}15;
  }
`;

export const SaveButtonWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`;

export const SaveButton = styled.button`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: ${COLOR.PRIMARY};
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 24px ${COLOR.PRIMARY}44;

  &:hover {
    background: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-2px);
    box-shadow: 0 12px 28px ${COLOR.PRIMARY}66;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${COLOR.BORDER};
    color: ${COLOR.TEXT_SECONDARY};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
