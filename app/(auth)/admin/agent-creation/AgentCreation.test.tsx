import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AgentCreation } from "./AgentCreation";
import { useBots } from "@/hooks/useBot";
import { useRouter, useSearchParams } from "next/navigation";

jest.mock("@/hooks/useBot");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe("AgentCreation Component", () => {
  const mockUseBots = useBots as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseSearchParams = useSearchParams as jest.Mock;
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockUseBots.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  describe("First-Time User Onboarding Flow", () => {
    it("renders Screen 1 (How did you hear about us?) with 1st dot active", () => {
      render(<AgentCreation />);

      expect(
        screen.getByText("How did you hear about us?")
      ).toBeInTheDocument();
      expect(screen.getByText("Google Search")).toBeInTheDocument();
      expect(
        screen.getByText("ChatGPT / Claude / other AI")
      ).toBeInTheDocument();

      const dot1 = screen.getByTestId("step-dot-1");
      const dot2 = screen.getByTestId("step-dot-2");
      expect(dot1).toHaveAttribute("data-active", "true");
      expect(dot2).toHaveAttribute("data-active", "false");

      const continueBtn = screen.getByTestId("wizard-continue-btn");
      expect(continueBtn).toBeDisabled();
    });

    it("allows selecting an option in Screen 1 and advancing to Screen 2", async () => {
      render(<AgentCreation />);

      const googleOption = screen.getByText("Google Search");
      fireEvent.click(googleOption);

      const continueBtn = screen.getByTestId("wizard-continue-btn");
      expect(continueBtn).not.toBeDisabled();

      fireEvent.click(continueBtn);

      await waitFor(() => {
        expect(
          screen.getByText("What's your company size?")
        ).toBeInTheDocument();
      });

      expect(screen.getByTestId("step-dot-1")).toHaveAttribute(
        "data-active",
        "true"
      );
      expect(screen.getByTestId("step-dot-2")).toHaveAttribute(
        "data-active",
        "true"
      );
      expect(screen.getByTestId("step-dot-3")).toHaveAttribute(
        "data-active",
        "false"
      );
    });

    it("allows navigating Back from Screen 2 to Screen 1", async () => {
      render(<AgentCreation />);

      fireEvent.click(screen.getByText("LinkedIn"));
      fireEvent.click(screen.getByTestId("wizard-continue-btn"));

      await waitFor(() => {
        expect(
          screen.getByText("What's your company size?")
        ).toBeInTheDocument();
      });

      const backBtn = screen.getByTestId("wizard-back-btn");
      fireEvent.click(backBtn);

      await waitFor(() => {
        expect(
          screen.getByText("How did you hear about us?")
        ).toBeInTheDocument();
      });
    });

    it("advances from Screen 2 to Screen 3 (How would you like to train AI Agent?)", async () => {
      render(<AgentCreation />);

      fireEvent.click(screen.getByText("X"));
      fireEvent.click(screen.getByTestId("wizard-continue-btn"));

      await waitFor(() => {
        expect(
          screen.getByText("What's your company size?")
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Startup (1-9)"));
      fireEvent.click(screen.getByTestId("wizard-continue-btn"));

      await waitFor(() => {
        expect(
          screen.getByText("How would you like to train AI Agent?")
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText("Your website (recommended)")
      ).toBeInTheDocument();
      expect(screen.getByTestId("website-url-input")).toBeInTheDocument();
      expect(screen.getByText("Add files")).toBeInTheDocument();
      expect(screen.getByText("Add text snippet")).toBeInTheDocument();
      expect(screen.getByText("Add Q&A's")).toBeInTheDocument();

      expect(screen.getByTestId("step-dot-1")).toHaveAttribute(
        "data-active",
        "true"
      );
      expect(screen.getByTestId("step-dot-2")).toHaveAttribute(
        "data-active",
        "true"
      );
      expect(screen.getByTestId("step-dot-3")).toHaveAttribute(
        "data-active",
        "true"
      );
      expect(screen.getByTestId("step-dot-4")).toHaveAttribute(
        "data-active",
        "false"
      );
    });

    it("allows entering website URL on Screen 3 and enables Continue", async () => {
      render(<AgentCreation />);

      fireEvent.click(screen.getByText("YouTube"));
      fireEvent.click(screen.getByTestId("wizard-continue-btn"));

      await waitFor(() => {
        fireEvent.click(screen.getByText("Small business (10-49)"));
      });
      fireEvent.click(screen.getByTestId("wizard-continue-btn"));

      await waitFor(() => {
        expect(
          screen.getByText("How would you like to train AI Agent?")
        ).toBeInTheDocument();
      });

      const urlInput = screen.getByTestId("website-url-input");
      fireEvent.change(urlInput, { target: { value: "mybrand.com" } });

      const continueBtn = screen.getByTestId("wizard-continue-btn");
      expect(continueBtn).not.toBeDisabled();
    });

    it("allows switching to text snippet and adding custom knowledge", async () => {
      render(<AgentCreation />);

      fireEvent.click(screen.getByText("Friend or colleague"));
      fireEvent.click(screen.getByTestId("wizard-continue-btn"));

      await waitFor(() => {
        fireEvent.click(screen.getByText("Enterprise (500+)"));
      });
      fireEvent.click(screen.getByTestId("wizard-continue-btn"));

      await waitFor(() => {
        expect(
          screen.getByText("How would you like to train AI Agent?")
        ).toBeInTheDocument();
      });

      const textCard = screen.getByTestId("source-card-text");
      fireEvent.click(textCard);

      expect(screen.getByTestId("text-snippet-drawer")).toBeInTheDocument();

      const textArea = screen.getByTestId("text-snippet-input");
      fireEvent.change(textArea, {
        target: { value: "Here is company knowledge base." },
      });

      const continueBtn = screen.getByTestId("wizard-continue-btn");
      expect(continueBtn).not.toBeDisabled();
    });
  });

  describe("Returning User Flow", () => {
    it("skips screens 1 & 2 and starts directly on Screen 3 if user has existing bots", () => {
      mockUseBots.mockReturnValue({
        data: [{ id: "bot-1", name: "Existing Bot" }],
        isLoading: false,
      });

      render(<AgentCreation />);

      expect(
        screen.getByText("How would you like to train AI Agent?")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("How did you hear about us?")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("What's your company size?")
      ).not.toBeInTheDocument();
    });

    it("forces first-time flow if ?firstTime=true is passed even with existing bots", () => {
      mockUseBots.mockReturnValue({
        data: [{ id: "bot-1", name: "Existing Bot" }],
        isLoading: false,
      });
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams("firstTime=true")
      );

      render(<AgentCreation />);

      expect(
        screen.getByText("How did you hear about us?")
      ).toBeInTheDocument();
    });
  });
});
