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
} from "./styled";

export const BotPreview = ({
  name,
  color,
  tone,
  contactEnabled,
  contactPrompt,
}: BotPreviewProps) => {
  return (
    <BotPreviewContainer>
      <BotPreviewTitle>Live Preview</BotPreviewTitle>

      <BotPreviewWrapper>
        <BotPreviewHeader $color={color}>{name || "Your Bot"}</BotPreviewHeader>

        <BotPreviewBody>
          <BubbleBot>Hello 👋 I&apos;m here to help!</BubbleBot>

          <BubbleUser color={color}>Tell me about your services</BubbleUser>

          <BubbleBot>
            Sure! I&apos;d be happy to help.
            <br />
            <small style={{ opacity: 0.6 }}>Tone: {tone}</small>
          </BubbleBot>

          {contactEnabled && (
            <BubbleBot>
              {contactPrompt || "Would you like us to contact you?"}
            </BubbleBot>
          )}
        </BotPreviewBody>
      </BotPreviewWrapper>
    </BotPreviewContainer>
  );
};

interface BubbleBotProps {
  children: ReactNode;
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
