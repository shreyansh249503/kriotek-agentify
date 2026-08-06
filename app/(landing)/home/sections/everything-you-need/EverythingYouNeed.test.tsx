import { render, screen } from "@testing-library/react";
import { EverythingYouNeed } from "./EverythingYouNeed";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

describe("EverythingYouNeed Component", () => {
  it("should render section header and all feature cards", () => {
    render(<EverythingYouNeed />);

    expect(screen.getByText("Everything You Need")).toBeInTheDocument();
    expect(
      screen.getByText("Things need to grow your Shopify")
    ).toBeInTheDocument();

    expect(screen.getByText("Shopify Integration")).toBeInTheDocument();
    expect(screen.getByText("Real - Time Order Tracking")).toBeInTheDocument();
    expect(screen.getByText("Product Catalog Sync")).toBeInTheDocument();
    expect(screen.getByText("AI Knowledge Base (RAG)")).toBeInTheDocument();
    expect(
      screen.getByText("Lead Capturing & Qualification")
    ).toBeInTheDocument();
    expect(screen.getByText("Dual-Agent Architecture")).toBeInTheDocument();
    expect(screen.getByText("Human Handoff")).toBeInTheDocument();
    expect(
      screen.getByText("Brand & Widget Customization")
    ).toBeInTheDocument();
  });
});
