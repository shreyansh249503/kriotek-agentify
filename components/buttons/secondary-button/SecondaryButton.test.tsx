import { render, screen, fireEvent } from "@testing-library/react";
import { SecondaryButton } from "./SecondaryButton";
import React from "react";

describe("SecondaryButton Component", () => {
  it("should render button with children and handle click events", () => {
    const handleClick = jest.fn();
    render(<SecondaryButton onClick={handleClick}>Click Me</SecondaryButton>);

    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render as an anchor link when href is provided", () => {
    render(<SecondaryButton href="/admin/settings">Settings</SecondaryButton>);

    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/admin/settings");
  });

  it("should respect disabled prop on button element", () => {
    const handleClick = jest.fn();
    render(<SecondaryButton disabled onClick={handleClick}>Disabled</SecondaryButton>);

    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
