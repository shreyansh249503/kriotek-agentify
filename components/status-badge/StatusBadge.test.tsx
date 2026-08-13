import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge Component", () => {
  it("should render active status badge correctly", () => {
    render(<StatusBadge status="active">Active Bot</StatusBadge>);

    const badge = screen.getByText("Active Bot");
    expect(badge).toBeInTheDocument();
  });

  it("should render inactive status badge correctly", () => {
    render(<StatusBadge status="inactive">Disabled Bot</StatusBadge>);

    const badge = screen.getByText("Disabled Bot");
    expect(badge).toBeInTheDocument();
  });
});
