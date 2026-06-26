import { PrimaryButtonStyle, PrimaryLinkStyle } from "./styled";

interface PrimaryButtonProps {
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const PrimaryButton = ({
  style,
  href,
  type = "button",
  disabled,
  onClick,
  children,
}: PrimaryButtonProps) => {
  if (href) {
    return (
      <PrimaryLinkStyle href={href} style={style} onClick={onClick}>
        {children}
      </PrimaryLinkStyle>
    );
  }

  return (
    <PrimaryButtonStyle
      style={style}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </PrimaryButtonStyle>
  );
};
