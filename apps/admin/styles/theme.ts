import { DefaultTheme } from "styled-components";

export const theme: DefaultTheme = {
  colors: {
    primary: "#A8E10C",
    primaryHover: "#95CC00",
    dark: "#2E2E2E",
    light: "#F5F5F5",
    cream: "#E8F0E0",
    background: "#9FCD6B",
    border: "#D4E8C1",
    text: "#2E2E2E",
    textSecondary: "#4A4A4A",
    white: "#FFFFFF",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    pill: "999px",
  },
  breakpoints: {
    mobile: "480px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1440px",
  },
};
