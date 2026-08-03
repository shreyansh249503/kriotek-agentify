import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BotForm } from "./BotForm";
import { Bot } from "@/types/bot";

// Mock child components that might make fetch/external calls if needed or mock supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "fake-token" } },
      }),
    },
  },
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

describe("BotForm", () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    global.alert = jest.fn();
  });

  const mockBot: Bot = {
    id: "bot-123",
    name: "Existing Bot",
    description: "An existing support bot",
    tone: "professional",
    primary_color: "#123456",
    contact_enabled: true,
    contact_email: "support@example.com",
    contact_prompt: "Contact prompt text",
    contact_email_message: "Contact message text",
    logo_url: "https://example.com/logo.png",
    ecommerce_enabled: true,
    ecommerce_prompt: "Sales prompt text",
    ecommerce_products: [
      { name: "Product 1", price: "$10", url: "https://example.com/p1", image: "" },
    ],
    public_key: "pub-key-123",
    created_at: "2026-01-01",
  };

  it("should render default values when no initialData is provided", () => {
    render(<BotForm onSubmit={mockSubmit} submitLabel="Create Bot" />);

    expect(screen.getByPlaceholderText("e.g. Support Assistant")).toHaveValue("");
    expect(screen.getByPlaceholderText("Describe what this bot does...")).toHaveValue("");
    expect(screen.getByText("Create Bot")).toBeInTheDocument();
  });

  it("should render initial data when provided", () => {
    render(<BotForm initialData={mockBot} onSubmit={mockSubmit} submitLabel="Update Bot" />);

    expect(screen.getByPlaceholderText("e.g. Support Assistant")).toHaveValue("Existing Bot");
    expect(screen.getByPlaceholderText("Describe what this bot does...")).toHaveValue("An existing support bot");
    expect(screen.getByText("Update Bot")).toBeInTheDocument();
    expect(screen.getByText("Product 1")).toBeInTheDocument();
  });

  it("should allow changing basic info fields", () => {
    render(<BotForm onSubmit={mockSubmit} submitLabel="Save" />);

    const nameInput = screen.getByPlaceholderText("e.g. Support Assistant");
    fireEvent.change(nameInput, { target: { value: "New Bot Name" } });
    expect(nameInput).toHaveValue("New Bot Name");

    const descInput = screen.getByPlaceholderText("Describe what this bot does...");
    fireEvent.change(descInput, { target: { value: "New Description" } });
    expect(descInput).toHaveValue("New Description");
  });

  it("should toggle lead collection and allow editing contact settings", () => {
    render(<BotForm onSubmit={mockSubmit} submitLabel="Save" />);

    const toggleSwitch = screen.getByText("Enable Lead Collection").previousElementSibling!;
    fireEvent.click(toggleSwitch);

    const emailInput = screen.getByPlaceholderText("email@example.com");
    fireEvent.change(emailInput, { target: { value: "lead@example.com" } });
    expect(emailInput).toHaveValue("lead@example.com");
  });

  it("should toggle e-commerce mode and handle product catalog operations", async () => {
    render(<BotForm onSubmit={mockSubmit} submitLabel="Save" />);

    const toggleSwitch = screen.getByText("Enable E-Commerce Mode").previousElementSibling!;
    fireEvent.click(toggleSwitch);

    const addProductBtn = screen.getByText("+ Add Product");
    fireEvent.click(addProductBtn);

    const nameInput = screen.getByLabelText(/Product Name/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const urlInput = screen.getByLabelText(/Product Link/i);

    fireEvent.change(nameInput, { target: { value: "Test Item" } });
    fireEvent.change(priceInput, { target: { value: "$20" } });
    fireEvent.change(urlInput, { target: { value: "https://example.com/item" } });

    const saveDetailsBtn = screen.getByText("Save Details");
    fireEvent.click(saveDetailsBtn);

    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("should submit the form with cleaned product entries on form submission", async () => {
    render(<BotForm initialData={mockBot} onSubmit={mockSubmit} submitLabel="Save Bot" />);

    const submitBtn = screen.getByText("Save Bot");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Existing Bot",
          description: "An existing support bot",
          ecommerceProducts: [
            { name: "Product 1", price: "$10", url: "https://example.com/p1", image: "" },
          ],
        })
      );
    });
  });

  it("should display loading state when loading prop is true", () => {
    render(<BotForm onSubmit={mockSubmit} submitLabel="Create Bot" loading={true} />);

    const button = screen.getByText("Saving...");
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("should handle logo image upload successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: "https://example.com/uploaded-logo.png" }),
    });

    const { container } = render(<BotForm onSubmit={mockSubmit} submitLabel="Save" />);

    const file = new File(["dummy"], "logo.png", { type: "image/png" });
    const fileInput = container.querySelector('input[type="file"]');
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/upload", expect.any(Object));
      });
    }
  });

  it("should handle auto-extract products crawl request", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [{ name: "Crawled Product", price: "$30", url: "https://example.com/crawled", image: "" }],
      }),
    });

    render(<BotForm initialData={mockBot} onSubmit={mockSubmit} submitLabel="Save" />);

    const crawlInput = screen.getByPlaceholderText("https://example.com/shop");
    fireEvent.change(crawlInput, { target: { value: "https://example.com/shop" } });

    const extractBtn = screen.getByText("Extract Products");
    fireEvent.click(extractBtn);

    await waitFor(() => {
      expect(screen.getByText(/Success! Extracted and added 1 new products/i)).toBeInTheDocument();
    });
  });
});
