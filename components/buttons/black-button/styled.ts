import { COLOR } from "@/styles";
import Link from "next/link";
import styled, { css } from "styled-components";

const buttonStyles = css`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${COLOR.DARK};
  color: ${COLOR.WHITE};
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid ${COLOR.DARK};
  font-family: inherit;

  &:hover:not(:disabled) {
    background: ${COLOR.PRIMARY};
    color: ${COLOR.DARK};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 10px 25px rgba(168, 225, 12, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const BlackLinkStyle = styled(Link)`
  ${buttonStyles}

  .arrow-icon {
    color: ${COLOR.PRIMARY};
  }

  &:hover {
    .arrow-icon {
      color: ${COLOR.DARK};
    }
  }
`;

export const BlackButtonStyle = styled.button`
  ${buttonStyles}

  .arrow-icon {
    color: ${COLOR.PRIMARY};
  }
  &:hover {
    .arrow-icon {
      color: ${COLOR.DARK};
    }
  }
`;
