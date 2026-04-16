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
  logoUrl,
}: BotPreviewProps) => {
  return (
    <BotPreviewContainer>
      <BotPreviewTitle>Live Preview</BotPreviewTitle>

      <BotPreviewWrapper>
        <BotPreviewHeader $color={color}>{name || "Your Bot"}</BotPreviewHeader>

        <BotPreviewBody>
          <BubbleBot logoUrl={logoUrl}>Hello 👋 I&apos;m here to help!</BubbleBot>

          <BubbleUser color={color}>Tell me about your services</BubbleUser>

          <BubbleBot logoUrl={logoUrl}>
            Sure! I&apos;d be happy to help.
            <br />
            <small style={{ opacity: 0.6 }}>Tone: {tone}</small>
          </BubbleBot>

          {contactEnabled && (
            <BubbleBot logoUrl={logoUrl}>
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
  logoUrl?: string;
}

function BubbleBot({ children, logoUrl }: BubbleBotProps) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Bot Avatar"
          style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
              background: "#4F46E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
              color: "white",
            fontSize: "12px",
          }}
        >
          AI
        </div>
      )}
      <BubbleBotContainer>{children}</BubbleBotContainer>
    </div>
  );
}

interface BubbleUserProps {
  children: ReactNode;
  color: string;
}

function BubbleUser({ children, color }: BubbleUserProps) {
  return <BubbleUserContainer $color={color}>{children}</BubbleUserContainer>;
}
