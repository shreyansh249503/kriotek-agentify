import { render, screen } from "@testing-library/react";
import { ChartTooltip } from "./ChartTooltip";
import React from "react";

describe("ChartTooltip Component", () => {
  it("should return null if active is false or payload is empty", () => {
    const { container: c1 } = render(<ChartTooltip active={false} payload={[]} label="Test" />);
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(<ChartTooltip active={true} payload={[]} label="Test" />);
    expect(c2.firstChild).toBeNull();
  });

  it("should render label and payload values when active is true", () => {
    const payload = [
      { name: "Interactions", value: 45, fill: "#2563eb" },
      { name: "Leads", value: 8, fill: "#10b981" },
    ];

    render(<ChartTooltip active={true} payload={payload} label="Sales Assistant" />);

    expect(screen.getByText("Sales Assistant")).toBeInTheDocument();
    expect(screen.getByText("Interactions:")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("Leads:")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });
});
