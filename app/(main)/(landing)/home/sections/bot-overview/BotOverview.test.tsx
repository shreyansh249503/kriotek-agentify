import { render, screen } from "@testing-library/react";
import { BotOverview } from "./BotOverview";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

describe("BotOverview Component", () => {
  it("should render titles, headings, and bot overview cards", () => {
    render(<BotOverview />);

    expect(screen.getByText("Powerful Order Tracking")).toBeInTheDocument();
    expect(
      screen.getByText(/Slash “ Where is my order\? ” tickets/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Where is my order #1002")).toBeInTheDocument();

    expect(screen.getByText("Multi Agent Architecture")).toBeInTheDocument();
    expect(
      screen.getByText("The right agent for every customer interaction.")
    ).toBeInTheDocument();
  });
});
