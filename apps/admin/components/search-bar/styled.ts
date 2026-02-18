"use client";

import { COLOR } from "@/styles";
import styled from "styled-components";

export const SearchBarContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid ${COLOR.BORDER};
  border-radius: 99px;
  padding: 4px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  &:focus-within {
    background: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 8px 24px rgba(168, 225, 12, 0.15);
    transform: translateY(-1px);
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  background: transparent;
  border: none;
  font-size: 15px;
  color: ${COLOR.DARK};
  outline: none;

  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY};
    opacity: 0.7;
  }
`;

export const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLOR.TEXT_SECONDARY};
  font-size: 20px;
  transition: color 0.3s ease;

  ${SearchBarContainer}:focus-within & {
    color: ${COLOR.PRIMARY};
  }
`;

export const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${COLOR.TEXT_SECONDARY};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${COLOR.DARK};
    transform: scale(1.1);
  }
`;
