import { render, screen } from "@testing-library/react";
import { HowItWorks } from "./HowItWorks";

jest.mock("../../components", () => ({
  InstructionCard: ({
    number,
    title,
    description,
  }: {
    number: string;
    title: string;
    description: string;
  }) => (
    <div data-testid="instruction-card">
      <span>{number}</span>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  ),
}));

describe("HowItWorks Component", () => {
  it("should render benefits section title and instruction cards", () => {
    render(<HowItWorks />);

    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(
      screen.getByText("Get your AI agent up and running in just a few simple steps.")
    ).toBeInTheDocument();

    const cards = screen.getAllByTestId("instruction-card");
    expect(cards).toHaveLength(4);

    expect(screen.getByText("Create Your Agent")).toBeInTheDocument();
    expect(screen.getByText("Add Your Knowledge")).toBeInTheDocument();
    expect(screen.getByText("Customize & Train")).toBeInTheDocument();
    expect(screen.getByText("Deploy Anywhere")).toBeInTheDocument();
  });
});
