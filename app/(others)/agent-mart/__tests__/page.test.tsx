import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DemoAgentMartPage from "../page";
import { useBot, useBots } from "@/hooks/useBot";

jest.mock("@/hooks/useBot");

describe("DemoAgentMartPage Component", () => {
  const mockedUseBot = useBot as jest.Mock;
  const mockedUseBots = useBots as jest.Mock;

  const mockBotData = {
    id: "zn0ZR5xEHFp7jdhA",
    public_key: "pk_test_agentmart_123",
    name: "Agent Mart Assistant",
    ecommerce_enabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseBot.mockReturnValue({
      data: mockBotData,
      isLoading: false,
    });
    mockedUseBots.mockReturnValue({
      data: [mockBotData],
      isLoading: false,
    });
  });

  it("renders page sub-sections without crash", () => {
    render(<DemoAgentMartPage />);

    expect(screen.getByText("TRENDING NOW")).toBeInTheDocument();
    expect(screen.getByText("Free Shipping")).toBeInTheDocument();
    expect(screen.getByText("Shop by Categories")).toBeInTheDocument();
    expect(screen.getByText("Fashion your Style")).toBeInTheDocument();
    expect(screen.getByText("Flash Sale")).toBeInTheDocument();
  });

  it("injects widget script into DOM with bot public_key", async () => {
    render(<DemoAgentMartPage />);

    await waitFor(() => {
      const script = document.querySelector('script[src="/widget.js"]');
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute("bot-id", "pk_test_agentmart_123");
    });
  });
});
