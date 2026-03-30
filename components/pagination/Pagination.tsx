"use client";

import React from "react";
import {
  PaginationContainer,
  PageInfo,
  PaginationActions,
  PaginationButton,
} from "./styled";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <PaginationContainer>
      <PageInfo>
        Showing {startItem} to {endItem} of {totalItems} entries
      </PageInfo>
      <PaginationActions>
        <PaginationButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <CaretLeft weight="bold" />
        </PaginationButton>
        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <CaretRight weight="bold" />
        </PaginationButton>
      </PaginationActions>
    </PaginationContainer>
  );
};
