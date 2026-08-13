import { render, screen, fireEvent } from "@testing-library/react";
import { CustomSelect } from "./CustomSelect";

describe("CustomSelect Component", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("should render selected option label", () => {
    render(<CustomSelect value="option1" onChange={jest.fn()} options={options} />);

    expect(screen.getByRole("button", { name: "Option 1" })).toBeInTheDocument();
  });

  it("should render fallback text when selected value does not match any option", () => {
    render(<CustomSelect value="nonexistent" onChange={jest.fn()} options={options} />);

    expect(screen.getByRole("button", { name: "Select an option" })).toBeInTheDocument();
  });

  it("should open options menu on click and select an option", () => {
    const handleChange = jest.fn();
    render(<CustomSelect value="option1" onChange={handleChange} options={options} />);

    const selectBtn = screen.getByRole("button", { name: "Option 1" });
    fireEvent.click(selectBtn);

    expect(screen.getByText("Option 2")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Option 2"));
    expect(handleChange).toHaveBeenCalledWith("option2");
  });

  it("should close dropdown menu when clicking outside", () => {
    render(
      <div>
        <span data-testid="outside">Outside Element</span>
        <CustomSelect value="option1" onChange={jest.fn()} options={options} />
      </div>
    );

    const selectBtn = screen.getByRole("button", { name: "Option 1" });
    fireEvent.click(selectBtn);

    expect(screen.getByText("Option 2")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside"));
  });
});
