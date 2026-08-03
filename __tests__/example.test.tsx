import { render, screen } from "@testing-library/react";

function Header({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

describe("Header Component", () => {
  it("renders the header title correctly", () => {
    render(<Header title="Hello World" />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Hello World");
  });
});
