import { render, screen, fireEvent } from "@testing-library/react";
import { SalesShowcase } from "./SalesShowcase";
import React from "react";

jest.mock("@/components", () => ({
  PrimaryButton: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("SalesShowcase Component", () => {
  it("should render titles, capability cards, simulation controls, and status", () => {
    render(<SalesShowcase />);

    expect(screen.getByText("Featured Capability")).toBeInTheDocument();
    expect(screen.getByText("Increase Sales with AI Agents")).toBeInTheDocument();

    expect(screen.getByText("Interactive Catalog Embeds")).toBeInTheDocument();
    expect(screen.getByText("Advanced Pitch Playbooks")).toBeInTheDocument();
    expect(screen.getByText("Automated Lead Capture")).toBeInTheDocument();

    expect(screen.getByText("Agentify Sales Assistant")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();

    expect(screen.getByText("Restart Demo")).toBeInTheDocument();
    expect(screen.getByText("Pause Simulation")).toBeInTheDocument();
  });

  it("should handle pause/resume simulation toggle", () => {
    render(<SalesShowcase />);

    const toggleButton = screen.getByText("Pause Simulation");
    fireEvent.click(toggleButton);

    expect(screen.getByText("Resume Simulation")).toBeInTheDocument();
  });
});
