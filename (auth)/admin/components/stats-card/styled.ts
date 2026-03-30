import { COLOR } from "@/styles";
import styled from "styled-components";

export const GlassPanel = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${COLOR.BORDER}88;
  border-radius: 24px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.03),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  padding: 28px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const StatCard = styled(GlassPanel)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: ${COLOR.BACKGROUND_2};
  border: 1px solid ${COLOR.PRIMARY};
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: radial-gradient(
      circle at bottom right,
      ${COLOR.PRIMARY}15,
      transparent 70%
    );
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
    border-color: ${COLOR.PRIMARY}88;
  }
`;

export const StatCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

export const StatIconBox = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${COLOR.LIGHT};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  box-shadow:
    0 4px 12px ${({ $color }) => $color}15,
    inset 0 0 0 1px ${COLOR.BORDER};
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  ${StatCard}:hover & {
    transform: scale(1.1) rotate(-8deg);
    color: ${COLOR.PRIMARY_HOVER};
    box-shadow: 0 8px 16px ${COLOR.PRIMARY}22;
  }
`;

export const StatDelta = styled.span<{ $up?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  color: ${({ $up }) => ($up ? COLOR.DARK : COLOR.TEXT_SECONDARY)};
  background: ${({ $up }) => ($up ? "#f7fee7" : "#fef2f2")};
  padding: 4px 10px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const StatValue = styled.p`
  font-size: 34px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin: 0;
  line-height: 1;
  letter-spacing: -1.2px;
`;

export const StatLabel = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 0;
  opacity: 0.8;
`;
