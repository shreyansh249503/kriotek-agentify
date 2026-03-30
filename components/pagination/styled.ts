import { COLOR } from "@/styles";
import styled from "styled-components";

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: ${COLOR.WHITE};
  border-top: 1px solid ${COLOR.BORDER}66;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

export const PageInfo = styled.div`
  font-size: 13px;
  color: ${COLOR.TEXT_SECONDARY};

  strong {
    color: ${COLOR.DARK};
    font-weight: 700;
  }
`;

export const PaginationActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid ${COLOR.BORDER};
  background: ${COLOR.WHITE};
  color: ${COLOR.TEXT_SECONDARY};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    border-color: ${COLOR.PRIMARY};
    color: ${COLOR.DARK};
    background: ${COLOR.PRIMARY}11;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
    background: ${COLOR.LIGHT};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;
