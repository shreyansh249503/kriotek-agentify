import { render, screen } from "@testing-library/react";
import { FeaturedCapability } from "./FeaturedCapability";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

describe("FeaturedCapability Component", () => {
  it("should render featured title, main heading, and feature capability cards", () => {
    render(<FeaturedCapability />);

    expect(screen.getByText("Featured Capability")).toBeInTheDocument();
    expect(screen.getByText("Increase Sales with AI Agents")).toBeInTheDocument();

    expect(screen.getByText("Smart Recommendations")).toBeInTheDocument();
    expect(screen.getByText("Instant Support")).toBeInTheDocument();
    expect(screen.getByText("Lead Capture")).toBeInTheDocument();
    expect(screen.getByText("Sales Growth")).toBeInTheDocument();

    const cardImages = screen.getAllByAltText("Card image");
    expect(cardImages.length).toBeGreaterThanOrEqual(4);
  });
});
