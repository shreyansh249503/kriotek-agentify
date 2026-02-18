"use client";

import { COLOR } from "@/styles";
import styled from "styled-components";

export const Form = styled.form`
  width: 80%;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const BotFormTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: ${COLOR.DARK};
`;

export const Input = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid ${COLOR.BORDER};
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: ${COLOR.LIGHT};
  color: ${COLOR.DARK};

  &:focus {
    outline: none;
    background: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
  }

  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 16px;
  border: 2px solid ${COLOR.BORDER};
  border-radius: 12px;
  font-size: 15px;
  min-height: 120px;
  transition: all 0.3s ease;
  background: ${COLOR.LIGHT};
  color: ${COLOR.DARK};
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    background: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
  }

  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 16px;
  border: 2px solid ${COLOR.BORDER};
  border-radius: 12px;
  font-size: 15px;
  background-color: ${COLOR.LIGHT};
  color: ${COLOR.DARK};
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  padding-right: 40px;

  &:focus {
    outline: none;
    background-color: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
  }

  &:hover {
    border-color: ${COLOR.TEXT_SECONDARY};
  }

  option {
    padding: 8px;
    font-size: 14px;
  }
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  background-color: ${COLOR.CREAM};
  /* background-color: #a8e10c2f; */
  border-radius: 16px;
  border: 1px solid ${COLOR.BORDER};
  box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.1);
`;

export const SectionHeader = styled.div`
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const HelperText = styled.p`
  font-size: 13px;
  color: ${COLOR.TEXT_SECONDARY};
  margin-top: 4px;
  margin-bottom: 0;
`;

export const ToggleContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  user-select: none;
`;

export const ToggleSwitch = styled.div<{ checked: boolean }>`
  position: relative;
  width: 52px;
  height: 28px;
  background-color: ${({ checked }) =>
    checked ? COLOR.PRIMARY : COLOR.BORDER};
  border-radius: 999px;
  transition: all 0.3s ease;

  &::after {
    content: "";
    position: absolute;
    top: 4px;
    left: ${({ checked }) => (checked ? "28px" : "4px")};
    width: 20px;
    height: 20px;
    background-color: ${COLOR.WHITE};
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 16px;
  font-size: 17px;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(168, 225, 12, 0.3);
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(168, 225, 12, 0.4);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
