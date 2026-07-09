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

  .arrow-icon {
    transition: transform 0.2s ease;
  }

  &:hover {
    .arrow-icon {
      transform: translateX(4px);
    }
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
`;

export const BlackButtonStyle = styled.button`
  ${buttonStyles}

  .arrow-icon {
    color: ${COLOR.PRIMARY};
  }
`;
