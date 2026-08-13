import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/components", () => ({
  BlackButton: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("Hero Component", () => {
  it("should render main headings, tag buttons, CTA, and chatbot preview", () => {
    render(<Hero />);

    expect(screen.getByText(/Build AI Agents/i)).toBeInTheDocument();
    expect(screen.getByText("Results.")).toBeInTheDocument();
    expect(screen.getByText(/Capture Leads/i)).toBeInTheDocument();
    expect(screen.getByText(/Qualify Instantly/i)).toBeInTheDocument();
    expect(screen.getByText(/Close more Deals/i)).toBeInTheDocument();

    expect(screen.getByText("Built Your Free Agent")).toBeInTheDocument();
    expect(screen.getByText("Watch Demo")).toBeInTheDocument();
    expect(screen.getByAltText("Chat bot Preview")).toBeInTheDocument();
  });
});
