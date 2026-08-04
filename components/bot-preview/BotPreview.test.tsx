import { render, screen } from "@testing-library/react";
import { BotPreview } from "./BotPreview";
import React from "react";

// Mock next/image if needed
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

describe("BotPreview Component", () => {
  it("should render default bot title, default name 'Your Bot', and AI placeholder when props are minimal", () => {
    render(<BotPreview name="" color="#000000" tone="Friendly" contactEnabled={false} />);

    expect(screen.getByText("Live Preview")).toBeInTheDocument();
    expect(screen.getByText("Your Bot")).toBeInTheDocument();
    expect(screen.getAllByText("AI")).toHaveLength(2); // Header avatar + Launcher avatar
    expect(screen.getByText("Hello 👋 I'm here to help!")).toBeInTheDocument();
    expect(screen.getByText("Tell me about your services")).toBeInTheDocument();
    expect(screen.getByText("Tone: Friendly")).toBeInTheDocument();
  });

  it("should render custom name, logo image, and contact prompt when contactEnabled is true", () => {
    render(
      <BotPreview
        name="Sales Assistant"
        color="#2563eb"
        tone="Professional"
        contactEnabled={true}
        contactPrompt="Please leave your email so we can follow up!"
        logoUrl="https://example.com/logo.png"
      />
    );

    expect(screen.getByText("Sales Assistant")).toBeInTheDocument();
    const images = screen.getAllByAltText("Sales Assistant");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "https://example.com/logo.png");

    expect(
      screen.getByText("Please leave your email so we can follow up!")
    ).toBeInTheDocument();
  });

  it("should render fallback contact prompt when contactEnabled is true but contactPrompt is empty", () => {
    render(
      <BotPreview
        name="Support Bot"
        color="#10b981"
        tone="Empathetic"
        contactEnabled={true}
      />
    );

    expect(
      screen.getByText("Would you like us to contact you?")
    ).toBeInTheDocument();
  });
});
