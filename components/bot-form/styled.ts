"use client";

import { COLOR, BREAKPOINTS } from "@/styles";
import styled from "styled-components";

export const Form = styled.form`
  width: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
export const FormContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: ${BREAKPOINTS.DESKTOP}) {
    flex-direction: column;
  }
`;

export const LeftContainer = styled.div`
  flex: 1;
  width: 100%;
  max-width: 100%;
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
  gap: 12px;
  padding: 32px;
  background-color: ${COLOR.CREAM};
  border-radius: 16px;
  border: 1px solid ${COLOR.BORDER};
  height: 100%;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 20px;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;
`;

export const TopRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: ${BREAKPOINTS.DESKTOP}) {
    grid-template-columns: 1fr;
  }
`;

export const SectionHeader = styled.div`
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
  width: fit-content;
  padding: 12px 32px;
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

export const EmbedSection = styled.div`
  padding: 20px;
  background-color: ${COLOR.CREAM};
  border-radius: 16px;
  border: 1px solid ${COLOR.BORDER};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const CodeBlock = styled.div`
  position: relative;
  background: ${COLOR.DARK};
  padding: 14px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  overflow: hidden;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
`;

export const CodeText = styled.code`
  font-family: "Fira Code", monospace;
  font-size: 14px;
  color: #a8e10c;
  word-break: break-all;
  line-height: 1.5;
`;

export const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const CopyStatus = styled.span`
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${COLOR.PRIMARY};
  letter-spacing: 0.05em;
  pointer-events: none;
`;
export const SideContainer = styled.div`
  position: sticky;
  top: 105px;
  height: fit-content;
  width: 100%;
  max-width: 420px;
  flex-shrink: 0;

  @media (max-width: ${BREAKPOINTS.DESKTOP}) {
    position: static;
    max-width: 100%;
  }
`;

export const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 10px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: 1fr;
  }
`;

export const UploadContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
`;

export const UploadButton = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${COLOR.WHITE};
  border: 2px dashed ${COLOR.BORDER};
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: ${COLOR.DARK};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY};
    background: ${COLOR.LIGHT};
  }

  input {
    display: none;
  }
`;

export const RemoveButton = styled.button`
  background: #a8e10b6b;
  border: 1px solid #a8e10b;
  color: #2E2E2E;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 50px;
  transition: all 0.2s;

  &:hover {
    background: rgba(168, 225, 11, 0.75);
  }
`;
