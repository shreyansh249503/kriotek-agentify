import React from "react";
import { render, screen } from "@testing-library/react";
import { ToastNotification } from "../ToastNotification";

describe("ToastNotification Component", () => {
  it("renders toast message when visible", () => {
    render(<ToastNotification visible={true} message="Item added to cart!" />);

    const messageElement = screen.getByText("Item added to cart!");
    expect(messageElement).toBeInTheDocument();
  });

  it("renders checkmark icon when visible", () => {
    render(<ToastNotification visible={true} message="Test Toast" />);

    const checkmark = screen.getByText("✓");
    expect(checkmark).toBeInTheDocument();
  });
});
