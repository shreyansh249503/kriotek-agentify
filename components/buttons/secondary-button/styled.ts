import { COLOR } from "@/styles";
import Link from "next/link";
import styled, { css } from "styled-components";

const buttonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 32px;
  color: ${COLOR.TEXT};
  background-color: ${COLOR.WHITE};
  font-weight: 700;
  border-radius: 10px;
  text-decoration: none;
  border: 2px solid ${COLOR.BORDER};
  transition: all 0.3s ease;
  cursor: pointer;
  font-family: inherit;

  &:hover:not(:disabled) {
    border-color: ${COLOR.PRIMARY};
    color: ${COLOR.DARK};
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SecondaryLinkStyle = styled(Link)`
  ${buttonStyles}
`;

export const SecondaryButtonStyle = styled.button`
  ${buttonStyles}
`;

