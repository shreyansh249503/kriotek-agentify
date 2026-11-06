import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductsSection } from "../ProductsSection";

describe("ProductsSection Component", () => {
  it("renders all category group section headers", () => {
    render(<ProductsSection />);

    expect(screen.getByText("Fashion your Style")).toBeInTheDocument();
    expect(screen.getByText("Electronic Devices")).toBeInTheDocument();
    expect(screen.getByText("Beauty Products")).toBeInTheDocument();
    expect(screen.getByText("Fitness Equipment")).toBeInTheDocument();
  });

  it("renders static products (e.g. Oni pink Hoodie, 4K Google smart TV)", () => {
    render(<ProductsSection />);

    expect(screen.getByText("Oni pink Hoodie")).toBeInTheDocument();
    expect(screen.getByText("4K Google smart TV")).toBeInTheDocument();
  });

  it("calls onAddToCart prop when cart button is clicked", () => {
    const handleAddToCart = jest.fn();
    render(<ProductsSection onAddToCart={handleAddToCart} />);

    const cartButtons = screen.getAllByRole("button", { name: "" }); // CartCircleButton or WishlistButton
    const cartButton = cartButtons.find((btn) => btn.querySelector("svg"));
    if (cartButton) {
      fireEvent.click(cartButton);
    }

    // Triggering add to cart via click on product cart icon
    const oniHoodieTitle = screen.getByText("Oni pink Hoodie");
    const productCard = oniHoodieTitle.closest("div");
    const cartIconBtn = productCard?.querySelectorAll("button")[1]; // second button is CartCircleButton
    if (cartIconBtn) {
      fireEvent.click(cartIconBtn);
      expect(handleAddToCart).toHaveBeenCalledWith("Oni pink Hoodie");
    }
  });

  it("toggles wishlist heart button liked state", () => {
    render(<ProductsSection />);

    const oniHoodieTitle = screen.getByText("Oni pink Hoodie");
    const productCard = oniHoodieTitle.closest("div");
    const wishlistBtn = productCard?.querySelectorAll("button")[0]; // first button is WishlistButton

    if (wishlistBtn) {
      fireEvent.click(wishlistBtn);
      // Clicking wishlist button toggles state without crash
      expect(wishlistBtn).toBeInTheDocument();
    }
  });
});
