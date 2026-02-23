"use client";

import { BREAKPOINTS, COLOR } from "@/styles";
import Link from "next/link";
import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: ${COLOR.LIGHT};
  padding: 48px 16px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 24px 16px;
  }
`;

export const AdminContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.DESKTOP}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
  }
`;

export const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

export const FilterSelect = styled.select`
  padding: 16px;
  padding-right: 32px;
  background-color: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 999px;
  font-size: 14px;
  color: ${COLOR.DARK};
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' style='fill: %232E2E2E;transform: ;msFilter:;'%3E%3Cpath d='M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 20px;
  min-width: 150px;

  &:focus {
    border-color: ${COLOR.PRIMARY};
  }
`;

export const AdminContentWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
  }
`;

export const BotCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px;
  background-color: ${COLOR.WHITE};
  border-radius: 16px;
  box-shadow: 0 4px 12px ${COLOR.SHADOW};
  border: 1px solid ${COLOR.BORDER};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: ${COLOR.PRIMARY};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

    &::before {
      opacity: 1;
    }
  }
`;

export const BotMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;
export const BotName = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: ${COLOR.DARK};
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    color: ${COLOR.PRIMARY};
  }
`;

export const BotDescription = styled.p`
  font-size: 14px;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px;
`;

export const BotActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
`;

export const IngestButton = styled(Link)`
  padding: 8px 24px;
  background-color: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  border-radius: 999px;
  text-decoration: none;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${COLOR.SHADOW};
  }
`;

export const EditBotButton = styled(Link)`
  padding: 8px 24px;
  background-color: ${COLOR.WHITE};
  border-radius: 999px;
  text-decoration: none;
  text-align: center;
  border: 2px solid ${COLOR.PRIMARY};
  font-size: 15px;
  font-weight: 600;
  color: ${COLOR.PRIMARY};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${COLOR.PRIMARY};
    color: ${COLOR.DARK};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${COLOR.SHADOW};
  }
`;
