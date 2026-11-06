import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroSection } from "../HeroSection";

describe("HeroSection Component", () => {
  it("renders badge, title, and subtitle text", () => {
    render(<HeroSection />);

    expect(screen.getByText("TRENDING NOW")).toBeInTheDocument();
    expect(screen.getByText(/Discover Products/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Shop the latest trending products/i)
    ).toBeInTheDocument();
  });

  it("calls onShopNowClick callback when Shop Now CTA button is clicked", () => {
    const handleShopNow = jest.fn();
    render(<HeroSection onShopNowClick={handleShopNow} />);

    const shopNowBtn = screen.getByRole("button", { name: /Shop Now/i });
    fireEvent.click(shopNowBtn);

    expect(handleShopNow).toHaveBeenCalledTimes(1);
  });

  it("calls onExploreClick callback when Explore Collection CTA button is clicked", () => {
    const handleExplore = jest.fn();
    render(<HeroSection onExploreClick={handleExplore} />);

    const exploreBtn = screen.getByRole("button", { name: /Explore Collection/i });
    fireEvent.click(exploreBtn);

    expect(handleExplore).toHaveBeenCalledTimes(1);
  });

  it("renders floating products", () => {
    render(<HeroSection />);

    expect(screen.getByText("Red Chief 530")).toBeInTheDocument();
    expect(screen.getByText("Smart Watch")).toBeInTheDocument();
    expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
    expect(screen.getByText("Water Bottle")).toBeInTheDocument();
  });
});
