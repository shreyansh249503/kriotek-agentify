import { render, screen } from "@testing-library/react";
import React from "react";
import { FeaturesCard } from "./FeaturesCard";

describe("FeaturesCard Component", () => {
  it("should render icon, title, and description correctly", () => {
    const mockProps = {
      icon: <span data-testid="feature-icon">🚀</span>,
      title: "Smart Automation",
      description: "Automate customer support and sales instantly.",
    };

    render(<FeaturesCard {...mockProps} />);

    expect(screen.getByTestId("feature-icon")).toBeInTheDocument();
    expect(screen.getByText("Smart Automation")).toBeInTheDocument();
    expect(
      screen.getByText("Automate customer support and sales instantly.")
    ).toBeInTheDocument();
  });
});
