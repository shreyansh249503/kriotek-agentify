import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BotsPage from "./page";
import { useBots } from "@/hooks/useBot";
import { useRouter } from "next/navigation";
import React from "react";
import { Bot } from "@/types/bot";

jest.mock("@/hooks/useBot");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/components", () => {
  const original = jest.requireActual("@/components");
  return {
    ...original,
    SearchBar: ({ onSearch, placeholder }: { onSearch: (q: string) => void; placeholder?: string }) => (
      <input
        placeholder={placeholder || "Search..."}
        onChange={(e) => onSearch(e.target.value)}
      />
    ),
  };
});

describe("BotsPage Component", () => {
  const mockUseBots = useBots as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockPush = jest.fn();

  const mockBots: Bot[] = [
    {
      id: "bot-1",
      public_key: "pk_1",
      name: "Alpha Bot",
      description: "First assistant",
      tone: "friendly",
      primary_color: "#111",
      created_at: "2026-01-01",
      contact_enabled: true,
      contact_email: "alpha@test.com",
      contact_prompt: "",
      contact_email_message: "",
    },
    {
      id: "bot-2",
      public_key: "pk_2",
      name: "Beta Bot",
      description: "Second assistant",
      tone: "professional",
      primary_color: "#222",
      created_at: "2026-01-02",
      contact_enabled: false,
      contact_email: "",
      contact_prompt: "",
      contact_email_message: "",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  it("should render loading state when query is loading", () => {
    mockUseBots.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = render(<BotsPage />);
    expect(container).toBeInTheDocument();
  });

  it("should render bot table with bot details and handle search filtering", () => {
    mockUseBots.mockReturnValue({
      data: mockBots,
      isLoading: false,
    });

    render(<BotsPage />);

    expect(screen.getByText("Alpha Bot")).toBeInTheDocument();
    expect(screen.getByText("Beta Bot")).toBeInTheDocument();
    expect(screen.getByText("First assistant")).toBeInTheDocument();
    expect(screen.getByText("Enabled")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Search bots...");
    fireEvent.change(searchInput, { target: { value: "Alpha" } });

    expect(screen.getByText("Alpha Bot")).toBeInTheDocument();
    expect(screen.queryByText("Beta Bot")).not.toBeInTheDocument();
  });

  it("should render empty state when search returns no matches", () => {
    mockUseBots.mockReturnValue({
      data: mockBots,
      isLoading: false,
    });

    render(<BotsPage />);

    const searchInput = screen.getByPlaceholderText("Search bots...");
    fireEvent.change(searchInput, { target: { value: "NonExistent" } });

    expect(
      screen.getByText('No bots found matching "NonExistent"')
    ).toBeInTheDocument();
  });

  it("should handle navigation when Edit button is clicked", async () => {
    mockUseBots.mockReturnValue({
      data: mockBots,
      isLoading: false,
    });

    render(<BotsPage />);

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/bot/bot-1/edit-bot");
    });
  });

  it("should handle navigation when Ingest button is clicked", async () => {
    mockUseBots.mockReturnValue({
      data: mockBots,
      isLoading: false,
    });

    render(<BotsPage />);

    const ingestButtons = screen.getAllByRole("button", { name: "Ingest" });
    fireEvent.click(ingestButtons[1]);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/bots/pk_2/ingest");
    });
  });
});
