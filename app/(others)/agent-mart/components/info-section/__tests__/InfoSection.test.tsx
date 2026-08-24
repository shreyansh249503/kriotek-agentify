import React from "react";
import { render, screen } from "@testing-library/react";
import { InfoSection } from "../InfoSection";

describe("InfoSection Component", () => {
  it("renders all 4 feature cards", () => {
    render(<InfoSection />);

    expect(screen.getByText("Free Shipping")).toBeInTheDocument();
    expect(screen.getByText("Secure Payments")).toBeInTheDocument();
    expect(screen.getByText("Easy Return")).toBeInTheDocument();
    expect(screen.getByText("24/7 Support")).toBeInTheDocument();
  });

  it("renders feature descriptions accurately", () => {
    render(<InfoSection />);

    expect(screen.getByText("On shopping over $50")).toBeInTheDocument();
    expect(screen.getByText("100% secure checkout")).toBeInTheDocument();
    expect(screen.getByText("30-days return policy")).toBeInTheDocument();
    expect(screen.getByText("Always here to help")).toBeInTheDocument();
  });
});
