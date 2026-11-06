import { render, screen } from "@testing-library/react";
import { FinalCTA } from "./FinalCTA";
import React from "react";

jest.mock("@/components", () => ({
  PrimaryButton: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("FinalCTA Component", () => {
  it("should render call to action title, description, and signup button", () => {
    render(<FinalCTA />);

    expect(
      screen.getByText("Ready to Transform Your Experience?")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Join thousands of businesses using Agentify to automate support and engage customers intelligently."
      )
    ).toBeInTheDocument();

    expect(screen.getByText("Build your agent for free")).toBeInTheDocument();
    expect(screen.getByText("No credit card required")).toBeInTheDocument();
  });
});
