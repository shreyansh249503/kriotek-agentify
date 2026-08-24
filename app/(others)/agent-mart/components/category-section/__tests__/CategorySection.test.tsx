import React from "react";
import { render, screen } from "@testing-library/react";
import { CategorySection } from "../CategorySection";

describe("CategorySection Component", () => {
  it("renders section header title and see all button", () => {
    render(<CategorySection />);

    expect(screen.getByText("Shop by Categories")).toBeInTheDocument();
    expect(screen.getByText(/View All Categories/i)).toBeInTheDocument();
  });

  it("renders category titles (Fashion, Electronics, Beauty, Fitness)", () => {
    render(<CategorySection />);

    expect(screen.getByText("Fashion")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Beauty")).toBeInTheDocument();
    expect(screen.getByText("Fitness")).toBeInTheDocument();
  });

  it("renders Shop Now links inside category cards", () => {
    render(<CategorySection />);

    const shopNowElements = screen.getAllByText(/Shop Now/i);
    expect(shopNowElements.length).toBeGreaterThanOrEqual(4);
  });
});
