import { render, screen } from "@testing-library/react";
import { WhatAgentifyProvides } from "./WhatAgentifyProvides";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

jest.mock("@/components", () => ({
  BlackButton: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

describe("WhatAgentifyProvides Component", () => {
  it("should render title button, heading, description, explore button, and cards", () => {
    render(<WhatAgentifyProvides />);

    expect(screen.getByText("What Agentify Provides ?")).toBeInTheDocument();
    expect(
      screen.getByText("Things we provide to build agents & scale your business.")
    ).toBeInTheDocument();
    expect(screen.getByText("Explore all features")).toBeInTheDocument();

    expect(screen.getByText("AI Support Agents")).toBeInTheDocument();
    expect(screen.getByText("Lead Capture & Ingestion")).toBeInTheDocument();
    expect(screen.getByText("E-Commerce Assistant")).toBeInTheDocument();
    expect(screen.getByText("Real-Time Analytics")).toBeInTheDocument();
  });
});
