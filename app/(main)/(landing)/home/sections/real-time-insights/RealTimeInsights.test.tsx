import { render, screen } from "@testing-library/react";
import { RealTimeInsights } from "./RealTimeInsights";
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

describe("RealTimeInsights Component", () => {
  it("should render analytics title, heading, list items, and dashboard images", () => {
    render(<RealTimeInsights />);

    expect(screen.getByText("Real Time Analytics")).toBeInTheDocument();
    expect(screen.getByText("Track. Analyze. Grow")).toBeInTheDocument();

    expect(screen.getByText("Live conversations")).toBeInTheDocument();
    expect(screen.getByText("Performance metrics")).toBeInTheDocument();
    expect(screen.getByText("Lead analytics")).toBeInTheDocument();
    expect(screen.getByText("Conversion tracking")).toBeInTheDocument();

    expect(screen.getByAltText("dashboard image")).toBeInTheDocument();
    expect(screen.getByAltText("flowting img")).toBeInTheDocument();
  });
});
