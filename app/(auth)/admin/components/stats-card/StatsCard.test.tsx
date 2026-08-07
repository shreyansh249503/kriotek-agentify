import { render, screen } from "@testing-library/react";
import { StatsCard } from "./StatsCard";
import React from "react";

describe("StatsCard Component", () => {
  it("should render stat title, length value, delta text, and icon", () => {
    render(
      <StatsCard
        title="Total Bots"
        botsLength={12}
        statDelta="+2"
        deltaText="this week"
        icon={<span data-testid="stat-icon">Icon</span>}
      />
    );

    expect(screen.getByText("Total Bots")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByText("this week")).toBeInTheDocument();
    expect(screen.getByTestId("stat-icon")).toBeInTheDocument();
  });
});
