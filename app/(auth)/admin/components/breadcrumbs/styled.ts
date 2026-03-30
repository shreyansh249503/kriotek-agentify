// components/breadcrumbs/styled.ts
import styled from "styled-components";
import Link from "next/link";
import { COLOR } from "@/styles";

export const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
`;

export const BreadcrumbItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  span {
  font-size: 20px;
  font-weight: 700;
  color: ${COLOR.DARK};
  }
`;

export const BreadcrumbLink = styled(Link)`
  font-size: 20px;
  font-weight: 700;
  color: ${COLOR.DARK};
  text-decoration: none;
  transition: color 0.15s ease;
`;

export const BreadcrumbSeparator = styled.span`
  display: flex;
  align-items: center;
  color: #d1d5db;
`;
