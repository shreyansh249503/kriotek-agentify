import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "./Pagination";

describe("Pagination Component", () => {
  it("should return null if totalPages is 1 or less", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} pageSize={10} totalItems={5} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render page info and navigation buttons when totalPages > 1", () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={handlePageChange}
        pageSize={10}
        totalItems={45}
      />
    );

    expect(screen.getByText("Showing 11 to 20 of 45 entries")).toBeInTheDocument();

    const prevBtn = screen.getByRole("button", { name: "Previous page" });
    const nextBtn = screen.getByRole("button", { name: "Next page" });

    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(prevBtn);
    expect(handlePageChange).toHaveBeenCalledWith(1);

    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it("should disable previous button on first page and next button on last page", () => {
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} pageSize={10} totalItems={25} />
    );

    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();

    rerender(
      <Pagination currentPage={3} totalPages={3} onPageChange={jest.fn()} pageSize={10} totalItems={25} />
    );

    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});
