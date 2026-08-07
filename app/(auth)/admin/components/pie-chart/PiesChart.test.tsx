import { render, screen } from "@testing-library/react";
import { PiesChart } from "./PiesChart";
import React from "react";

// Mock recharts ResponsiveContainer
jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 400 }}>{children}</div>
    ),
  };
});

describe("PiesChart Component", () => {
  it("should render Leads by Source title, legend items, and percentage values", () => {
    const pieData = [
      { name: "Website", value: 60 },
      { name: "Shopify", value: 25 },
      { name: "WhatsApp", value: 10 },
      { name: "Others", value: 5 },
    ];

    const { container } = render(<PiesChart pieData={pieData} />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText("Leads by Source")).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument();
    expect(screen.getByText("Shopify")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Others")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });
});
