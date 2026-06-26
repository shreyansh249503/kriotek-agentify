import { SecondaryButtonStyle, SecondaryLinkStyle } from "./styled";

interface SecondaryButtonProps {
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const SecondaryButton = ({
  style,
  href,
  type = "button",
  disabled,
  onClick,
  children,
}: SecondaryButtonProps) => {
  if (href) {
    return (
      <SecondaryLinkStyle href={href} style={style} onClick={onClick}>
        {children}
      </SecondaryLinkStyle>
    );
  }

  return (
    <SecondaryButtonStyle
      style={style}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </SecondaryButtonStyle>
  );
};

