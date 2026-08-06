import { BREAKPOINTS, COLOR } from "@/styles";
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
  box-sizing: border-box;

  .arrow-icon {
    font-size: 16px;
    transition: transform 0.2s ease;
    flex-shrink: 0;
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

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 14px 26px;
    font-size: 15px;
    border-radius: 10px;

    .arrow-icon {
      font-size: 15px;
    }
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 12px 20px;
    font-size: 14px;
    gap: 6px;
    border-radius: 8px;

    .arrow-icon {
      font-size: 14px;
    }
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

