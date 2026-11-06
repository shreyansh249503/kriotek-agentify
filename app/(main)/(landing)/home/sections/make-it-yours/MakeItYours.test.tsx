import { render, screen } from "@testing-library/react";
import { MakeItYours } from "./MakeItYours";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

describe("MakeItYours Component", () => {
  it("should render section badge, heading, and all 5 step labels with images", () => {
    render(<MakeItYours />);

    expect(screen.getByText("Make it Yours")).toBeInTheDocument();
    expect(
      screen.getByText("Fully Customizable. Matches your Brand Perfectly.")
    ).toBeInTheDocument();

    expect(screen.getByText("Name your Bot")).toBeInTheDocument();
    expect(screen.getByText("Choose Theme Color")).toBeInTheDocument();
    expect(screen.getByText("Set Bot Persona")).toBeInTheDocument();
    expect(screen.getByText("Choose Avatar")).toBeInTheDocument();
    expect(screen.getByText("Select Category")).toBeInTheDocument();

    expect(screen.getByAltText("Name your Bot")).toBeInTheDocument();
    expect(screen.getByAltText("Choose Theme Color")).toBeInTheDocument();
    expect(screen.getByAltText("Set Bot Persona")).toBeInTheDocument();
    expect(screen.getByAltText("Choose Avatar")).toBeInTheDocument();
    expect(screen.getByAltText("Select Category")).toBeInTheDocument();
  });
});
