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
            <img
              src={logoUrl}
              alt={name || "User"}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                objectFit: "contain",
                background: "white",
              }}
            />
          ) : (
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "Black",
                fontSize: "12px",
                fontWeight: "bold",
                flexShrink: 0,
              }}
            >
              AI
            </div>
          )}
          {name || "Your Bot"}
        </BotPreviewHeader>

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
      <ChatBotConatiner>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={name || "User"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.651)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "Black",
              fontSize: "20px",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            AI
          </div>
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
