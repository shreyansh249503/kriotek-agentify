import { render, screen } from "@testing-library/react";
import { LiveDemo } from "./LiveDemo";
import React from "react";

jest.mock("@/components", () => ({
  BlackButton: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("LiveDemo Component", () => {
  it("should render live demo heading, mock store preview, list features, and launch button", () => {
    render(<LiveDemo />);

    expect(screen.getByText("Interactive Experience")).toBeInTheDocument();
    expect(screen.getByText("Test Driven Live E-Comm")).toBeInTheDocument();

    expect(
      screen.getByText("What you can test in the live demo:")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Real-time interactive Q&A about product and usage.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("In-chat visual product card checkout.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Warm lead collection in exchange from promo codes.")
    ).toBeInTheDocument();

    expect(screen.getByText("Launch Live Demo Store")).toBeInTheDocument();
    expect(screen.getByText("aura-ayurveda.store/products")).toBeInTheDocument();
  });
});
