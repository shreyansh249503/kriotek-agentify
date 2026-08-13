import { render, screen, fireEvent, act } from "@testing-library/react";
import { ScrollToTop } from "./ScrollToTop";

describe("ScrollToTop Component", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  it("should toggle visibility on window scroll and handle scroll to top click", () => {
    render(<ScrollToTop />);

    const button = screen.getByRole("button", { hidden: true });

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 350, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    fireEvent.click(button);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });
});
