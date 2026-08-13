import { render, screen, fireEvent } from "@testing-library/react";
import { PerformanceTable } from "./PerformanceTable";
import { Bot } from "@/types/bot";

describe("PerformanceTable Component", () => {
  it("should render empty state message when convosPerBot is empty", () => {
    render(<PerformanceTable convosPerBot={[]} leadsPerBot={[]} bots={[]} />);

    expect(
      screen.getByText("Start a conversation to see performance metrics.")
    ).toBeInTheDocument();
  });

  it("should render bot stats, conversion rate, and handle pagination", () => {
    const convos = Array.from({ length: 7 }, (_, i) => ({
      bot_id: `bot-${i + 1}`,
      bot_name: `Bot ${i + 1}`,
      total_conversations: 10,
      total_messages: 50,
      conversations_this_month: 5,
      conversations_this_week: 2,
    }));

    const leads = [
      { bot_id: "bot-1", bot_name: "Bot 1", total_leads: 5 },
    ];

    const bots: Bot[] = [
      {
        id: "bot-1",
        public_key: "pk_1",
        name: "Bot 1",
        description: null,
        tone: "friendly",
        primary_color: "#000000",
        created_at: "2026-01-01",
        contact_enabled: false,
        contact_email: "",
        contact_prompt: "",
        contact_email_message: "",
      },
    ];

    render(<PerformanceTable convosPerBot={convos} leadsPerBot={leads} bots={bots} />);

    expect(screen.getByText("Bot 1")).toBeInTheDocument();
    expect(screen.getAllByText("10 chats")[0]).toBeInTheDocument();
    expect(screen.getByText("05")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Manage" })[0]).toHaveAttribute(
      "href",
      "/admin/bot/bot-1/edit-bot"
    );

    expect(screen.getByText("Showing 1 to 5 of 7 results")).toBeInTheDocument();

    const page2Btn = screen.getByRole("button", { name: "2" });
    fireEvent.click(page2Btn);

    expect(screen.getByText("Bot 6")).toBeInTheDocument();
    expect(screen.getByText("Showing 6 to 7 of 7 results")).toBeInTheDocument();
  });
});
