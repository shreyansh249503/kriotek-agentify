import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "./SearchBar";
import React from "react";

describe("SearchBar Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should render placeholder and input value", () => {
    render(<SearchBar placeholder="Search bots..." onSearch={jest.fn()} />);

    const input = screen.getByPlaceholderText("Search bots...");
    expect(input).toBeInTheDocument();
  });

  it("should trigger debounced search on input change", () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} debounceMs={300} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Customer bot" } });

    expect(handleSearch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(handleSearch).toHaveBeenCalledWith("Customer bot");
  });

  it("should clear search query when clear button is clicked", () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} debounceMs={300} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Query" } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    const clearButton = screen.getByRole("button", { name: "Clear search" });
    fireEvent.click(clearButton);

    expect(input).toHaveValue("");
    expect(handleSearch).toHaveBeenCalledWith("");
  });
});
