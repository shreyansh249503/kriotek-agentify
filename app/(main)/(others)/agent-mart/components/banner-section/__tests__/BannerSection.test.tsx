import React from "react";
import { render, screen, act } from "@testing-library/react";
import { BannerSection } from "../BannerSection";

describe("BannerSection Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders Flash Sale and Summer 2026 promo banners", () => {
    render(<BannerSection />);

    expect(screen.getByText("Flash Sale")).toBeInTheDocument();
    expect(screen.getByText("Up To 70% Off")).toBeInTheDocument();
    expect(screen.getByText("New Collection")).toBeInTheDocument();
    expect(screen.getByText("Summer 2026")).toBeInTheDocument();
  });

  it("decrements countdown timer seconds every 1000ms", () => {
    render(<BannerSection />);

    expect(screen.getByText("30")).toBeInTheDocument(); // initial seconds: 30

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("29")).toBeInTheDocument(); // decremented second: 29
  });

  it("renders Shop Collection buttons", () => {
    render(<BannerSection />);

    const buttons = screen.getAllByRole("button", { name: /Shop Collection/i });
    expect(buttons).toHaveLength(2);
  });
});
