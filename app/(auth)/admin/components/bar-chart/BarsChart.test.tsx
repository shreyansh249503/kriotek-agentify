import { render, screen } from "@testing-library/react";
import { BarsChart } from "./BarsChart";
import React from "react";

jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

describe("BarsChart Component", () => {
  it("should render Leads Over Time title, legends, select, and chart container", () => {
    const mockData = [
      { name: "Agentify", Interactions: 36, ContactsCollected: 24 },
    ];

    const { container } = render(<BarsChart botBarData={mockData} />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText("Leads Over Time")).toBeInTheDocument();
    expect(screen.getByText("Conversation")).toBeInTheDocument();
    expect(screen.getByText("Leads")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Monthly")).toBeInTheDocument();
  });
});
