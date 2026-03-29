import { COLOR } from "@/styles";
import styled from "styled-components";

export const BotPreviewContainer = styled.div`
  position: sticky;
  top: 105px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: fit-content;
  padding: 20px;
  background-color: ${COLOR.CREAM};
  border-radius: 16px;
  border: 1px solid ${COLOR.BORDER};
`;
export const BotPreviewTitle = styled.label`
  font-size: 18px;
  font-weight: 700;
  color: ${COLOR.DARK};
`;
export const BotPreviewWrapper = styled.div`
  width: 320px;
  border: 1px solid ${COLOR.BORDER};
  border-radius: 12px;
  overflow: hidden;
`;
export const BotPreviewHeader = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color};
  color: ${COLOR.WHITE};
  padding: 10px 12px;
  font-weight: 600;
`;
export const BotPreviewBody = styled.div`
  padding: 12px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const BubbleBotContainer = styled.div`
  align-self: flex-start;
  background: #eee;
  padding: 8px 10px;
  border-radius: 12px 12px 12px 4px;
  font-size: 14px;
  max-width: 80%;
`;

export const BubbleUserContainer = styled.div<{ $color: string }>`
  align-self: flex-end;
  background: ${({ $color }) => $color};
  color: ${COLOR.WHITE};
  padding: 8px 10px;
  border-radius: 12px 12px 4px 12px;
  font-size: 14px;
  max-width: 80%;
`;
