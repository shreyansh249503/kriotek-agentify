import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductCard } from "./ProductCard";
import { Product } from "@/types/bot";
import React from "react";

describe("ProductCard Component", () => {
  const sampleProduct: Product = {
    id: "prod-1",
    name: "Sample Sneakers",
    price: "49.99 USD",
    url: "https://example.com/sneakers",
    image: "https://example.com/sneakers.jpg",
  };

  const mockOnSave = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnUpdateProduct = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    window.alert = jest.fn();
  });

  describe("Display Mode (isEditing = false)", () => {
    it("should render product details correctly", () => {
      render(
        <ProductCard
          product={sampleProduct}
          idx={0}
          isEditing={false}
          onSave={mockOnSave}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onUpdateProduct={mockOnUpdateProduct}
          ecommerceEnabled={true}
        />
      );

      expect(screen.getByText("Sample Sneakers")).toBeInTheDocument();
      expect(screen.getByText("49.99 USD")).toBeInTheDocument();
      expect(screen.getByText("https://example.com/sneakers")).toBeInTheDocument();
      expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/sneakers.jpg");
    });

    it("should display 'No Image' placeholder if image is missing", () => {
      render(
        <ProductCard
          product={{ ...sampleProduct, image: "" }}
          idx={0}
          isEditing={false}
          onSave={mockOnSave}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onUpdateProduct={mockOnUpdateProduct}
          ecommerceEnabled={true}
        />
      );

      expect(screen.getByText("No Image")).toBeInTheDocument();
    });

    it("should trigger onEdit and onDelete when corresponding action buttons are clicked", () => {
      render(
        <ProductCard
          product={sampleProduct}
          idx={0}
          isEditing={false}
          onSave={mockOnSave}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onUpdateProduct={mockOnUpdateProduct}
          ecommerceEnabled={true}
        />
      );

      fireEvent.click(screen.getByTitle("Edit Product"));
      expect(mockOnEdit).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTitle("Delete Product"));
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edit Mode (isEditing = true)", () => {
    it("should render form inputs populated with product data", () => {
      render(
        <ProductCard
          product={sampleProduct}
          idx={0}
          isEditing={true}
          onSave={mockOnSave}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onUpdateProduct={mockOnUpdateProduct}
          ecommerceEnabled={true}
        />
      );

      expect(screen.getByDisplayValue("Sample Sneakers")).toBeInTheDocument();
      expect(screen.getByDisplayValue("49.99 USD")).toBeInTheDocument();
      expect(screen.getByDisplayValue("https://example.com/sneakers")).toBeInTheDocument();
    });

    it("should call onUpdateProduct when inputs change", () => {
      render(
        <ProductCard
          product={sampleProduct}
          idx={0}
          isEditing={true}
          onSave={mockOnSave}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onUpdateProduct={mockOnUpdateProduct}
          ecommerceEnabled={true}
        />
      );

      const nameInput = screen.getByDisplayValue("Sample Sneakers");
      fireEvent.change(nameInput, { target: { value: "Updated Sneakers" } });

      expect(mockOnUpdateProduct).toHaveBeenCalledWith({
        ...sampleProduct,
        name: "Updated Sneakers",
      });
    });

    it("should validate inputs on blur and disable save button when invalid", () => {
      render(
        <ProductCard
          product={{ ...sampleProduct, url: "invalid-url" }}
          idx={0}
          isEditing={true}
          onSave={mockOnSave}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onUpdateProduct={mockOnUpdateProduct}
          ecommerceEnabled={true}
        />
      );

      const urlInput = screen.getByDisplayValue("invalid-url");
      fireEvent.blur(urlInput);

      expect(screen.getByText("Invalid URL (must start with http:// or https://)")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Save Details/i })).toBeDisabled();
    });

    it("should call onSave and onDelete from edit action buttons", () => {
      render(
        <ProductCard
          product={sampleProduct}
          idx={0}
          isEditing={true}
          onSave={mockOnSave}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onUpdateProduct={mockOnUpdateProduct}
          ecommerceEnabled={true}
        />
      );

      const saveButton = screen.getByRole("button", { name: /Save Details/i });
      expect(saveButton).not.toBeDisabled();
      fireEvent.click(saveButton);
      expect(mockOnSave).toHaveBeenCalledTimes(1);

      const deleteButton = screen.getByRole("button", { name: /Delete Product/i });
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it("should handle image upload successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ url: "https://example.com/uploaded.jpg" }),
      });

      render(
        <ProductCard
          product={sampleProduct}
          idx={0}
          isEditing={true}
          onSave={mockOnSave}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onUpdateProduct={mockOnUpdateProduct}
          ecommerceEnabled={true}
        />
      );

      const file = new File(["dummy content"], "test.png", { type: "image/png" });
      const fileInput = document.querySelector("#product-image-0") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/upload", expect.any(Object));
        expect(mockOnUpdateProduct).toHaveBeenCalledWith({
          ...sampleProduct,
          image: "https://example.com/uploaded.jpg",
        });
      });
    });

    it("should alert error if file size exceeds 1MB", () => {
      render(
        <ProductCard
          product={sampleProduct}
          idx={0}
          isEditing={true}
          onSave={mockOnSave}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onUpdateProduct={mockOnUpdateProduct}
          ecommerceEnabled={true}
        />
      );

      // Create a file larger than 1MB
      const largeFile = new File([new ArrayBuffer(1024 * 1024 + 1)], "large.png", {
        type: "image/png",
      });
      const fileInput = document.querySelector("#product-image-0") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(window.alert).toHaveBeenCalledWith("File is too large. Max size is 1MB.");
    });

    it("should handle numeric price in edit mode without throwing error", () => {
      const numericProduct = {
        ...sampleProduct,
        price: 29.99 as unknown as string,
      };

      expect(() =>
        render(
          <ProductCard
            product={numericProduct}
            idx={0}
            isEditing={true}
            onSave={mockOnSave}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onUpdateProduct={mockOnUpdateProduct}
            ecommerceEnabled={true}
          />
        )
      ).not.toThrow();
    });
  });
});
