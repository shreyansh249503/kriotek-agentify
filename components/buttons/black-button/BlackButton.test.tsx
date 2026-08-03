import { render, screen, fireEvent } from "@testing-library/react";
import { BlackButton } from "./BlackButton";
import React from "react";

describe("BlackButton Component", () => {
  it("should render button with children and handle click events", () => {
    const handleClick = jest.fn();
    render(<BlackButton onClick={handleClick}>Click Me</BlackButton>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render as an anchor link when href is provided", () => {
    render(<BlackButton href="/admin/dashboard">Go to Dashboard</BlackButton>);

    const link = screen.getByRole("link", { name: /go to dashboard/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/admin/dashboard");
  });

  it("should respect disabled prop on button element", () => {
    const handleClick = jest.fn();
    render(<BlackButton disabled onClick={handleClick}>Disabled Button</BlackButton>);

    const button = screen.getByRole("button", { name: /disabled button/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
