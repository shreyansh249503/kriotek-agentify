"use client";

import { COLOR } from "@/styles";
import styled from "styled-components";

export const SearchBarContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 48px;
  background-color: ${COLOR.WHITE};
  border: 2px solid ${COLOR.BORDER};
  border-radius: 999px;
  font-size: 15px;
  color: ${COLOR.DARK};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
  }

  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY};
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${COLOR.TEXT_SECONDARY};
  font-size: 20px;
  pointer-events: none;
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
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
    background-color: ${COLOR.LIGHT};
    color: ${COLOR.DARK};
  }
`;
