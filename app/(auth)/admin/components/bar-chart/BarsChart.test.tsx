import { render } from "@testing-library/react";
import { BarsChart } from "./BarsChart";
import React from "react";

// Mock recharts ResponsiveContainer
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
  it("should render bar chart container without crashing", () => {
    const mockData = [
      { name: "Bot 1", Interactions: 50, ContactsCollected: 12 },
    ];

    const { container } = render(<BarsChart botBarData={mockData} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
