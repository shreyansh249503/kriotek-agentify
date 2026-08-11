import { render, screen } from "@testing-library/react";
import AdminContent from "./AdminContent";
import useAdminContent from "@/hooks/useAdminContent";
import useMotion from "@/hooks/useMotion";
import React from "react";
import { Bot } from "@/types/bot";

jest.mock("@/hooks/useAdminContent");
jest.mock("@/hooks/useMotion");

jest.mock("./components", () => ({
  BarsChart: () => <div data-testid="bars-chart">BarsChart</div>,
  PiesChart: () => <div data-testid="pies-chart">PiesChart</div>,
  PerformanceTable: () => <div data-testid="performance-table">PerformanceTable</div>,
  StatsCard: ({ title, botsLength }: { title: string; botsLength: number }) => (
    <div data-testid="stats-card">
      {title}: {botsLength}
    </div>
  ),
}));

describe("AdminContent Component", () => {
  const mockUseAdminContent = useAdminContent as jest.Mock;
  const mockUseMotion = useMotion as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMotion.mockReturnValue({
      containerVariants: {},
      itemVariants: {},
    });
  });

  it("should render loading state when isLoading is true", () => {
    mockUseAdminContent.mockReturnValue({
      isLoading: true,
    });

    const { container } = render(<AdminContent />);
    expect(container).toBeInTheDocument();
  });

  it("should render dashboard stats, charts, and table when loaded", () => {
    const mockBot: Bot = {
      id: "bot-1",
      public_key: "pk_1",
      name: "Assistant One",
      description: "Test bot",
      tone: "friendly",
      primary_color: "#000",
      created_at: "2026-01-01T00:00:00Z",
      contact_enabled: true,
      contact_email: "a@b.com",
      contact_prompt: "",
      contact_email_message: "",
    };

    mockUseAdminContent.mockReturnValue({
      bots: [mockBot],
      isLoading: false,
      totals: {
        total_conversations: 50,
        total_leads: 10,
        total_messages: 200,
      },
      conversionRate: "20.0",
      botBarData: [{ name: "Assistant One", count: 10 }],
      pieData: [{ name: "Assistant One", value: 10 }],
      convosPerBot: [],
      leadsPerBot: [],
      recentBots: [mockBot],
      recentActivities: [
        {
          id: "act-1",
          type: "lead",
          title: "New Lead Captured",
          timestamp: "02 min ago",
          href: "/admin/leads",
        },
      ],
      formatDate: () => "Jan 1, 2026",
    });

    render(<AdminContent />);

    expect(screen.getByText("Total Leads: 10")).toBeInTheDocument();
    expect(screen.getByText("Conversation: 50")).toBeInTheDocument();
    expect(screen.getByText("Conversion Rate: 20.0%")).toBeInTheDocument();
    expect(screen.getByText("Token used: 200")).toBeInTheDocument();

    expect(screen.getByTestId("bars-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pies-chart")).toBeInTheDocument();
    expect(screen.getByTestId("performance-table")).toBeInTheDocument();
    expect(screen.getByText("Agent Performance")).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByText("New Lead Captured")).toBeInTheDocument();
    expect(screen.getByText("Create Bot")).toBeInTheDocument();
  });

  it("should render empty fallback state when charts are empty", () => {
    mockUseAdminContent.mockReturnValue({
      bots: [],
      isLoading: false,
      totals: null,
      conversionRate: "0.0",
      botBarData: [],
      pieData: [],
      convosPerBot: [],
      leadsPerBot: [],
      recentBots: [],
      recentActivities: [],
      formatDate: () => "",
    });

    render(<AdminContent />);

    expect(screen.getByTestId("bars-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pies-chart")).toBeInTheDocument();
    expect(screen.getByText("Agent Performance")).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
  });
});
