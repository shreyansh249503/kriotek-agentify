import { render, screen } from "@testing-library/react";
import { HowItWork } from "./HowItWork";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

describe("HowItWork Component", () => {
  it("should render main heading and step items", () => {
    render(<HowItWork />);

    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(
      screen.getByText("Get your AI agents up and running in just a few simple steps.")
    ).toBeInTheDocument();

    expect(screen.getByText("Create Your Agent")).toBeInTheDocument();
    expect(screen.getByText("Add Your Knowledge")).toBeInTheDocument();
    expect(screen.getByText("Customize & Train")).toBeInTheDocument();
    expect(screen.getByText("Deploy Anywhere")).toBeInTheDocument();

    expect(screen.getByAltText("Create Your Agent illustration")).toBeInTheDocument();
    expect(screen.getByAltText("Add Your Knowledge illustration")).toBeInTheDocument();
    expect(screen.getByAltText("Customize & Train illustration")).toBeInTheDocument();
    expect(screen.getByAltText("Deploy Anywhere illustration")).toBeInTheDocument();
  });
});
