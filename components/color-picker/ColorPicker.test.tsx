import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPicker } from "./ColorPicker";
import React from "react";

describe("ColorPicker Component", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render color values in hex and RGB fields", () => {
    render(<ColorPicker value="#FF0000" onChange={mockOnChange} />);

    expect(screen.getByDisplayValue("FF0000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("255")).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("0")).toHaveLength(2); 
  });

  it("should call onChange when hex input is updated with a valid hex string", () => {
    render(<ColorPicker value="#FF0000" onChange={mockOnChange} />);

    const hexInput = screen.getByDisplayValue("FF0000");
    fireEvent.change(hexInput, { target: { value: "00FF00" } });

    expect(mockOnChange).toHaveBeenCalledWith("#00ff00");
  });

  it("should call onChange when RGB inputs are updated", () => {
    render(<ColorPicker value="#000000" onChange={mockOnChange} />);

    const rInput = screen.getAllByDisplayValue("0")[0];
    fireEvent.change(rInput, { target: { value: "200" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should select a preset color when swatch is clicked", () => {
    render(<ColorPicker value="#000000" onChange={mockOnChange} />);

    const resetButton = screen.getByRole("button", { name: /Reset color/i });
    fireEvent.click(resetButton);

    expect(mockOnChange).toHaveBeenCalledWith("#4f46e5");
  });
});
