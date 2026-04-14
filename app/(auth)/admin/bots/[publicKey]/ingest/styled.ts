"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import styled from "styled-components";

export const NewBotContainer = styled.div`
  width: 100%;
  min-height: 85vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

export const NewBotWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 8px 24px ${COLOR.SHADOW};
  background: ${COLOR.WHITE};
  gap: 30px;

  /* Animation */
  animation: slideIn 0.4s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
      padding: 20px;
      gap: 20px;
  }
`;

export const NewBotTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${COLOR.DARK};
  text-align: center;

    @media (max-width: ${BREAKPOINTS.MOBILE}) {
      font-size: 20px;
  }
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 16px;
  border-bottom: 2px solid ${COLOR.BORDER};
`;

export const TabButton = styled.button<{ $isActive: boolean }>`
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $isActive }) =>
    $isActive ? COLOR.PRIMARY : COLOR.TEXT_SECONDARY};
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: ${({ $isActive }) =>
    $isActive ? COLOR.PRIMARY : "transparent"};
    border-radius: 3px 3px 0 0;
    transition: all 0.3s ease;
  }

  &:hover {
    color: ${COLOR.PRIMARY};
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
      font-size: 14px;
  }
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const FileUploadZone = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px;
  border: 2px dashed ${COLOR.BORDER};
  border-radius: 16px;
  background-color: ${COLOR.LIGHT};
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  text-align: center;

  &:hover {
    border-color: ${COLOR.PRIMARY};
    background-color: rgba(168, 225, 12, 0.05);
  }

  strong {
    font-size: 18px;
    color: ${COLOR.DARK};
  }

  span {
    font-size: 14px;
    color: ${COLOR.TEXT_SECONDARY};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 24px;
  border: 2px solid ${COLOR.BORDER};
  border-radius: 16px;
  font-size: 15px;
  min-height: 200px;
  background-color: ${COLOR.LIGHT};
  color: ${COLOR.DARK};
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    background-color: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
  }

  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY};
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 24px;
  border: 2px solid ${COLOR.BORDER};
  border-radius: 16px;
  font-size: 15px;
  background-color: ${COLOR.LIGHT};
  color: ${COLOR.DARK};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    background-color: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
  }

  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY};
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: ${COLOR.PRIMARY};
  color: ${COLOR.WHITE};
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(168, 225, 12, 0.3);

  &:hover {
    background-color: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(168, 225, 12, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:active {
    transform: translateY(-1px);
  }
`;

export const LoadingText = styled.p`
  text-align: center;
  color: ${COLOR.PRIMARY};
  font-size: 16px;
  font-weight: 500;
  margin: 24px 0;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export const ErrorText = styled.div`
  text-align: center;
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  margin: 16px 0;
  padding: 16px;
  background: #fee2e2;
  border-radius: 12px;
  border-left: 4px solid #ef4444;
`;

export const SuccessContainer = styled.div`
  text-align: center;
  animation: scaleIn 0.4s ease-out;

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const ChunksText = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  margin-bottom: 32px;

  b {
    color: ${COLOR.PRIMARY};
    font-size: 20px;
  }
`;

export const ProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 0;
  width: 100%;
  animation: fadeIn 0.5s ease-out;
`;

export const CircularProgressBox = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SvgCircle = styled.svg`
  width: 120px;
  height: 120px;
  transform: rotate(-90deg);
`;

export const ProgressCircleBg = styled.circle`
  fill: none;
  stroke: ${COLOR.LIGHT};
  stroke-width: 8;
`;

export const ProgressCircleFill = styled.circle<{ $percent: number }>`
  fill: none;
  stroke: ${COLOR.PRIMARY};
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 339.292; /* 2 * PI * R (54) */
  stroke-dashoffset: ${({ $percent }) => 339.292 - (339.292 * $percent) / 100};
  transition: stroke-dashoffset 0.4s ease-out;
`;

export const PercentageText = styled.div`
  position: absolute;
  font-size: 24px;
  font-weight: 800;
  color: ${COLOR.DARK};
  display: flex;
  align-items: baseline;

  span {
    font-size: 14px;
    font-weight: 600;
    margin-left: 2px;
  }
`;

export const StatusLabel = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin: 10px 0;
  text-align: center;
  min-height: 30px;
`;

export const ProgressSubText = styled.p`
  font-size: 14px;
  color: ${COLOR.TEXT_SECONDARY};
  margin-top: 5px;
  font-weight: 500;
`;
