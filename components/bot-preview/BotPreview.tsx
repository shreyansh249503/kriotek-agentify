import { ReactNode } from "react";
import { BotPreviewProps } from "./type";
import {
  BotPreviewBody,
  BotPreviewContainer,
  BotPreviewHeader,
  BotPreviewTitle,
  BotPreviewWrapper,
  BubbleBotContainer,
  BubbleUserContainer,
  ChatBotConatiner,
  HeaderAvatarImage,
  HeaderAvatarPlaceholder,
  SmallToneText,
  LauncherAvatarImage,
  LauncherAvatarPlaceholder,
} from "./styled";

export const BotPreview = ({
  name,
  color,
  tone,
  contactEnabled,
  contactPrompt,
  logoUrl,
}: BotPreviewProps) => {
  return (
    <BotPreviewContainer>
      <BotPreviewTitle>Live Preview</BotPreviewTitle>
      <BotPreviewWrapper>
        <BotPreviewHeader $color={color}>
          {logoUrl ? (
            <HeaderAvatarImage src={logoUrl} alt={name || "User"} />
          ) : (
            <HeaderAvatarPlaceholder>AI</HeaderAvatarPlaceholder>
          )}
          {name || "Your Bot"}
        </BotPreviewHeader>

        <BotPreviewBody>
          <BubbleBot>Hello 👋 I&apos;m here to help!</BubbleBot>

          <BubbleUser color={color}>Tell me about your services</BubbleUser>

          <BubbleBot>
            Sure! I&apos;d be happy to help.
            <br />
            <SmallToneText>Tone: {tone}</SmallToneText>
          </BubbleBot>

          {contactEnabled && (
            <BubbleBot>
              {contactPrompt || "Would you like us to contact you?"}
            </BubbleBot>
          )}
        </BotPreviewBody>
      </BotPreviewWrapper>
      <ChatBotConatiner>
        {logoUrl ? (
          <LauncherAvatarImage src={logoUrl} alt={name || "User"} />
        ) : (
          <LauncherAvatarPlaceholder>AI</LauncherAvatarPlaceholder>
        )}
      </ChatBotConatiner>
    </BotPreviewContainer>
  );
};

interface BubbleBotProps {
  children: ReactNode;
  logoUrl?: string;
}

function BubbleBot({ children }: BubbleBotProps) {
  return <BubbleBotContainer>{children}</BubbleBotContainer>;
}

interface BubbleUserProps {
  children: ReactNode;
  color: string;
}

function BubbleUser({ children, color }: BubbleUserProps) {
  return <BubbleUserContainer $color={color}>{children}</BubbleUserContainer>;
}
