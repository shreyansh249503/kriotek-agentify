import { FaArrowRight } from "react-icons/fa6";
import { BlackButtonStyle, BlackLinkStyle } from "./styled";

interface BlackButtonProps {
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const BlackButton = ({
  style,
  href,
  type = "button",
  disabled,
  onClick,
  children,
}: BlackButtonProps) => {
  if (href) {
    return (
      <BlackLinkStyle href={href} style={style} onClick={onClick}>
        {children}
        <FaArrowRight className="arrow-icon" />
      </BlackLinkStyle>
    );
  }

  return (
    <BlackButtonStyle
      style={style}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      <FaArrowRight className="arrow-icon" />
    </BlackButtonStyle>
  );
};
