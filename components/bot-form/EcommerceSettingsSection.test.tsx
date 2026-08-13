import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EcommerceSettingsSection } from "./EcommerceSettingsSection";
import { CreateBotInput } from "@/types/bot";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "mock-token" } },
      }),
    },
  },
}));

describe("EcommerceSettingsSection Component", () => {
  const disabledForm: CreateBotInput = {
    name: "Shop Bot",
    description: "",
    ecommerceEnabled: false,
  };

  const enabledForm: CreateBotInput = {
    name: "Shop Bot",
    description: "",
    ecommerceEnabled: true,
    ecommercePrompt: "Offer 10% discount",
    ecommerceProducts: [
      { name: "Running Shoes", price: "79.99", url: "https://shop.com/shoes", image: "" },
    ],
  };

  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("should toggle ecommerce mode when switch is clicked", () => {
    render(<EcommerceSettingsSection form={disabledForm} update={mockUpdate} />);

    expect(screen.getByText("E-Commerce / Sales Settings")).toBeInTheDocument();
    expect(screen.getByText("Enable E-Commerce Mode")).toBeInTheDocument();

    const toggle = screen.getByText("Enable E-Commerce Mode").previousSibling!;
    fireEvent.click(toggle as Element);

    expect(mockUpdate).toHaveBeenCalledWith("ecommerceEnabled", true);
  });

  it("should render auto-extract URL input, product list, and sales prompt when enabled", () => {
    render(<EcommerceSettingsSection form={enabledForm} update={mockUpdate} />);

    expect(screen.getByPlaceholderText("https://example.com/shop")).toBeInTheDocument();
    expect(screen.getByText("Running Shoes")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Offer 10% discount")).toBeInTheDocument();
  });

  it("should crawl products from URL and update ecommerceProducts list", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [
          { name: "Wireless Headphones", price: "99.99", url: "https://shop.com/headphones", image: "" },
        ],
      }),
    });

    render(<EcommerceSettingsSection form={enabledForm} update={mockUpdate} />);

    const urlInput = screen.getByPlaceholderText("https://example.com/shop");
    fireEvent.change(urlInput, { target: { value: "https://shop.com/catalog" } });

    const extractBtn = screen.getByRole("button", { name: "Extract Products" });
    fireEvent.click(extractBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith("ecommerceProducts", [
        { name: "Running Shoes", price: "79.99", url: "https://shop.com/shoes", image: "" },
        { name: "Wireless Headphones", price: "99.99", url: "https://shop.com/headphones", image: "" },
      ]);
      expect(
        screen.getByText("Success! Extracted and added 1 new products to catalog.")
      ).toBeInTheDocument();
    });
  });

  it("should handle product addition manually when + Add Product button is clicked", () => {
    render(<EcommerceSettingsSection form={enabledForm} update={mockUpdate} />);

    const addBtn = screen.getByRole("button", { name: "+ Add Product" });
    fireEvent.click(addBtn);

    expect(mockUpdate).toHaveBeenCalledWith("ecommerceProducts", [
      { name: "Running Shoes", price: "79.99", url: "https://shop.com/shoes", image: "" },
      { name: "", price: "", image: "", url: "" },
    ]);
  });

  it("should handle products with numeric price without throwing errors", () => {
    const numericPriceForm: CreateBotInput = {
      name: "Shop Bot",
      description: "",
      ecommerceEnabled: true,
      ecommerceProducts: [
        { name: "Gadget", price: 29.99 as unknown as string, url: "https://shop.com/gadget", image: "" },
      ],
    };

    expect(() =>
      render(<EcommerceSettingsSection form={numericPriceForm} update={mockUpdate} />)
    ).not.toThrow();

    expect(screen.getByText("Gadget")).toBeInTheDocument();
  });
});
