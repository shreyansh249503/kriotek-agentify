import { render, screen } from "@testing-library/react";
import { InstructionCard } from "./InstructionCard";

describe("InstructionCard Component", () => {
  it("should render step number, title, and description correctly", () => {
    const mockProps = {
      number: "01",
      title: "Connect Your Store",
      description: "Integrate with Shopify in a single click.",
    };

    render(<InstructionCard {...mockProps} />);

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Connect Your Store")).toBeInTheDocument();
    expect(
      screen.getByText("Integrate with Shopify in a single click.")
    ).toBeInTheDocument();
  });
});
