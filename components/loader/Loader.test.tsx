import { render } from "@testing-library/react";
import { Loader } from "./Loader";

describe("Loader Component", () => {
  it("should render default loader component", () => {
    const { container } = render(<Loader />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render fullScreen loader component", () => {
    const { container } = render(<Loader fullScreen />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
