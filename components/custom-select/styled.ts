"use client";

import { COLOR } from "@/styles";
import styled from "styled-components";

export const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const SelectButton = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${(props) => (props.$isOpen ? COLOR.PRIMARY : "#e5e7eb")};
  border-radius: 12px;
  font-size: 15px;
  background-color: ${(props) => (props.$isOpen ? "#ffffff" : "#f9fafb")};
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  box-shadow: ${(props) =>
    props.$isOpen ? "0 0 0 4px rgba(102, 126, 234, 0.1)" : "none"};

  &:hover {
    background-color: #ffffff;
    border-color: ${(props) => (props.$isOpen ? COLOR.PRIMARY : "#9ca3af")};
  }

  &::after {
    content: "";
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%)
      rotate(${(props) => (props.$isOpen ? "180deg" : "0deg")});
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #6b7280;
    transition: transform 0.3s ease;
  }
`;

export const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 20;
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transform: ${(props) =>
    props.$isOpen ? "translateY(0)" : "translateY(-10px)"};
  transition: all 0.3s ease;
  overflow: hidden;
`;

export const Option = styled.div<{ $isSelected: boolean }>`
  padding: 12px 16px;
  font-size: 15px;
  cursor: pointer;
  background-color: ${(props) => (props.$isSelected ? "#fdfdfd" : "white")};
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background-color: #f9fafb;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
`;

export const OptionLabel = styled.span<{ $isSelected: boolean }>`
  font-weight: ${(props) => (props.$isSelected ? "600" : "400")};
  color: ${(props) => (props.$isSelected ? COLOR.PRIMARY : "#374151")};
`;

export const CheckIcon = styled.span`
  color: ${COLOR.PRIMARY};
  font-size: 18px;
  display: flex;
  align-items: center;
`;
