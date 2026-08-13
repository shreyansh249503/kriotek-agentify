import { render, screen, fireEvent } from "@testing-library/react";
import { BasicInfoSection } from "./BasicInfoSection";
import { CreateBotInput } from "@/types/bot";

describe("BasicInfoSection Component", () => {
  const initialForm: CreateBotInput = {
    name: "Customer Assistant",
    description: "Helps with order inquiries",
    tone: "friendly",
  };

  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render bot name, description, and tone fields", () => {
    render(<BasicInfoSection form={initialForm} update={mockUpdate} />);

    expect(screen.getByText("Basic Information")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Customer Assistant")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Helps with order inquiries")).toBeInTheDocument();
    expect(screen.getByText(/26 characters used/)).toBeInTheDocument();
  });

  it("should trigger update callback when bot name and description change", () => {
    render(<BasicInfoSection form={initialForm} update={mockUpdate} />);

    const nameInput = screen.getByDisplayValue("Customer Assistant");
    fireEvent.change(nameInput, { target: { value: "Sales Bot" } });
    expect(mockUpdate).toHaveBeenCalledWith("name", "Sales Bot");

    const descInput = screen.getByDisplayValue("Helps with order inquiries");
    fireEvent.change(descInput, { target: { value: "New description" } });
    expect(mockUpdate).toHaveBeenCalledWith("description", "New description");
  });
});
