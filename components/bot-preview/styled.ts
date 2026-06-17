import { COLOR, BREAKPOINTS } from "@/styles";
import Image from "next/image";
import styled from "styled-components";

export const BotPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  height: fit-content;
  padding: 20px;
  background-color: ${COLOR.CREAM};
  border-radius: 16px;
  border: 1px solid ${COLOR.BORDER};

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 16px;
  }
`;
export const BotPreviewTitle = styled.label`
  width: 100%;
  text-align: left;
  font-size: 18px;
  font-weight: 700;
  color: ${COLOR.DARK};
`;
export const BotPreviewWrapper = styled.div`
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  border: 1px solid ${COLOR.BORDER};
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: ${BREAKPOINTS.DESKTOP}) {
    max-width: 100%;
  }
`;
export const BotPreviewHeader = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color};
  color: ${COLOR.WHITE};
  padding: 10px 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;
export const BotAvatar = styled(Image)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: contain;
  background: rgba(255, 255, 255, 1);
`;
export const BubbleBotAvatar = styled(Image)`
  border-radius: 50%;
  object-fit: cover;
`;
export const BotPreviewBody = styled.div`
  padding: 14px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
export const ChatBotConatiner = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
`;
export const ChatBotConatinerImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const HeaderAvatarImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: contain;
  background: white;
`;

export const HeaderAvatarPlaceholder = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
`;

export const SmallToneText = styled.small`
  opacity: 0.6;
`;

export const LauncherAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const LauncherAvatarPlaceholder = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.651);
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
`;
