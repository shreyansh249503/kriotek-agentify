import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppearanceSection } from "./AppearanceSection";
import { CreateBotInput } from "@/types/bot";
import React from "react";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

describe("AppearanceSection Component", () => {
  const initialForm: CreateBotInput = {
    name: "Test Bot",
    description: "",
    primaryColor: "#4f46e5",
    logoUrl: "",
  };

  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    window.alert = jest.fn();
  });

  it("should render color picker and upload avatar button when logoUrl is empty", () => {
    render(<AppearanceSection form={initialForm} update={mockUpdate} />);

    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByText("Bot Avatar")).toBeInTheDocument();
    expect(screen.getByText("Upload Image")).toBeInTheDocument();
  });

  it("should render avatar preview image and handle remove logo click", () => {
    const formWithLogo = {
      ...initialForm,
      logoUrl: "https://example.com/avatar.png",
    };

    render(<AppearanceSection form={formWithLogo} update={mockUpdate} />);

    expect(screen.getByAltText("Bot Avatar")).toHaveAttribute("src", "https://example.com/avatar.png");

    const removeBtn = screen.getByRole("button", { name: "Remove" });
    fireEvent.click(removeBtn);

    expect(mockUpdate).toHaveBeenCalledWith("logoUrl", "");
  });

  it("should handle logo file upload successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: "https://example.com/uploaded.png" }),
    });

    render(<AppearanceSection form={initialForm} update={mockUpdate} />);

    const file = new File(["dummy content"], "logo.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]')!;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith("logoUrl", "https://example.com/uploaded.png");
    });
  });

  it("should alert if uploaded file exceeds 1MB", async () => {
    render(<AppearanceSection form={initialForm} update={mockUpdate} />);

    const largeFile = new File(["a".repeat(1024 * 1025)], "large.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]')!;

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(window.alert).toHaveBeenCalledWith("File is too large. Max size is 1MB.");
  });
});
