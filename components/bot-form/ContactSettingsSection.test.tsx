import { render, screen, fireEvent } from "@testing-library/react";
import { ContactSettingsSection } from "./ContactSettingsSection";
import { CreateBotInput } from "@/types/bot";
import React from "react";

describe("ContactSettingsSection Component", () => {
  const disabledForm: CreateBotInput = {
    name: "Test Bot",
    description: "",
    contactEnabled: false,
  };

  const enabledForm: CreateBotInput = {
    name: "Test Bot",
    description: "",
    contactEnabled: true,
    contactEmail: "leads@example.com",
    contactPrompt: "Leave your email below",
    contactEmailMessage: "Thanks! We will contact you.",
  };

  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should toggle lead collection when toggle switch is clicked", () => {
    render(<ContactSettingsSection form={disabledForm} update={mockUpdate} />);

    expect(screen.getByText("Contact Settings")).toBeInTheDocument();
    expect(screen.getByText("Enable Lead Collection")).toBeInTheDocument();

    expect(screen.queryByPlaceholderText("email@example.com")).not.toBeInTheDocument();

    const toggle = document.querySelector('div[class*="ToggleSwitch"]') || document.querySelector('button') || screen.getByText("Enable Lead Collection").previousSibling!;
    fireEvent.click(toggle as Element);

    expect(mockUpdate).toHaveBeenCalledWith("contactEnabled", true);
  });

  it("should render inputs for notification email, prompt, and confirmation message when enabled", () => {
    render(<ContactSettingsSection form={enabledForm} update={mockUpdate} />);

    expect(screen.getByDisplayValue("leads@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Leave your email below")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Thanks! We will contact you.")).toBeInTheDocument();
  });

  it("should trigger update on input change when contactEnabled is true", () => {
    render(<ContactSettingsSection form={enabledForm} update={mockUpdate} />);

    const emailInput = screen.getByDisplayValue("leads@example.com");
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    expect(mockUpdate).toHaveBeenCalledWith("contactEmail", "new@example.com");
  });
});
