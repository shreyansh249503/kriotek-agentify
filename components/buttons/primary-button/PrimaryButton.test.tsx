import { render, screen, fireEvent } from "@testing-library/react";
import { PrimaryButton } from "./PrimaryButton";
import React from "react";

describe("PrimaryButton Component", () => {
  it("should render button with children and handle click events", () => {
    const handleClick = jest.fn();
    render(<PrimaryButton onClick={handleClick}>Click Me</PrimaryButton>);

    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render as an anchor link when href is provided", () => {
    render(<PrimaryButton href="/admin/dashboard">Go to Dashboard</PrimaryButton>);

    const link = screen.getByRole("link", { name: "Go to Dashboard" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/admin/dashboard");
  });

  it("should respect disabled prop on button element", () => {
    const handleClick = jest.fn();
    render(<PrimaryButton disabled onClick={handleClick}>Disabled Button</PrimaryButton>);

    const button = screen.getByRole("button", { name: "Disabled Button" });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
