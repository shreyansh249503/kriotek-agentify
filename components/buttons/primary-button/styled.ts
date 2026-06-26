import { COLOR } from "@/styles";
import Link from "next/link";
import styled, { css } from "styled-components";

const buttonStyles = css`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 32px;
  background: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  font-weight: 700;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px ${COLOR.SHADOW};
  border: none;
  cursor: pointer;
  font-family: inherit;

  &:hover:not(:disabled) {
    box-shadow: 0 8px 20px rgba(168, 225, 12, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const PrimaryLinkStyle = styled(Link)`
  ${buttonStyles}
`;

export const PrimaryButtonStyle = styled.button`
  ${buttonStyles}
`;
