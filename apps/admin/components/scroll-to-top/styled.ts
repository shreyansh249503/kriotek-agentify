"use client";

import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
`;

export const ScrollButton = styled.button<{ $visible: boolean }>`
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  z-index: 100;
  transition: all 0.3s ease;
  visibility: ${(props) => (props.$visible ? "visible" : "hidden")};
  animation: ${(props) => (props.$visible ? fadeIn : fadeOut)} 0.3s forwards;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  svg {
    width: 24px;
    height: 24px;
    stroke-width: 2.5;
  }
`;
