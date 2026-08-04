import { render } from "@testing-library/react";
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
  it("should render pie chart container without crashing", () => {
    const pieData = [
      { name: "Bot 1", value: 40 },
      { name: "Bot 2", value: 60 },
    ];

    const { container } = render(<PiesChart pieData={pieData} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
