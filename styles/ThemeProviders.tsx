"use client";

import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./globalstyle";
import { theme } from "./theme";

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}
