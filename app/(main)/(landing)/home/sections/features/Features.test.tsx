import { render, screen } from "@testing-library/react";
import { Features } from "./Features";
import React from "react";

jest.mock("../../components", () => ({
  FeaturesCard: ({
    title,
    description,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div data-testid="features-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

describe("Features Component", () => {
  it("should render title, subtitle, and feature cards", () => {
    render(<Features />);

    expect(screen.getByText("Powerful Features")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Everything you need to build and deploy intelligent AI agents that scale with your business."
      )
    ).toBeInTheDocument();

    const featureCards = screen.getAllByTestId("features-card");
    expect(featureCards).toHaveLength(7);

    expect(screen.getByText("Easy Integration")).toBeInTheDocument();
    expect(screen.getByText("Customizable Responses")).toBeInTheDocument();
    expect(screen.getByText("Knowledge Base")).toBeInTheDocument();
    expect(screen.getByText("Real-time Analytics")).toBeInTheDocument();
    expect(screen.getByText("Multi-channel Support")).toBeInTheDocument();
    expect(screen.getByText("Secure & Scalable")).toBeInTheDocument();
    expect(screen.getByText("Sales & E-Commerce Mode")).toBeInTheDocument();
  });
});
