import { renderHook } from "@testing-library/react";
import useAdminContent, { formatTimeAgo } from "./useAdminContent";
import { useBots } from "@/hooks/useBot";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLeads } from "@/hooks/useLead";

jest.mock("@/hooks/useBot");
jest.mock("@/hooks/useAnalytics");
jest.mock("@/hooks/useLead");

describe("useAdminContent hook", () => {
  const mockedUseBots = useBots as jest.Mock;
  const mockedUseAnalytics = useAnalytics as jest.Mock;
  const mockedUseLeads = useLeads as jest.Mock;

  const mockBots = [
    { id: "bot-1", name: "Old Bot", created_at: "2025-01-01T00:00:00Z" },
    { id: "bot-2", name: "New Bot With A Very Long Name Indeed", created_at: "2025-06-01T00:00:00Z" },
    { id: "bot-3", name: "Medium Bot", created_at: "2025-03-01T00:00:00Z" },
    { id: "bot-4", name: "Bot 4", created_at: "2025-04-01T00:00:00Z" },
    { id: "bot-5", name: "Bot 5", created_at: "2025-05-01T00:00:00Z" },
  ];

  const mockAnalytics = {
    totals: {
      total_conversations: 20,
      total_leads: 5,
    },
    convosPerBot: [
      { bot_id: "bot-1", bot_name: "Old Bot", total_conversations: "10" },
      { bot_id: "bot-2", bot_name: "New Bot With A Very Long Name Indeed", total_conversations: "10" },
    ],
    leadsPerBot: [
      { bot_id: "bot-1", bot_name: "Old Bot", total_leads: "2" },
      { bot_id: "bot-2", bot_name: "New Bot With A Very Long Name Indeed", total_leads: "3" },
      { bot_id: "bot-3", bot_name: "Zero Leads Bot", total_leads: "0" },
    ],
  };

  const mockLeads = [
    { id: "lead-1", name: "John Doe", email: "john@example.com", created_at: "2025-06-02T00:00:00Z" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLeads.mockReturnValue({ data: [], isLoading: false });
  });

  it("should return isLoading true when bots, analytics, or leads are loading", () => {
    mockedUseBots.mockReturnValue({ data: [], isLoading: true });
    mockedUseAnalytics.mockReturnValue({ data: undefined, isLoading: false });
    mockedUseLeads.mockReturnValue({ data: [], isLoading: false });

    const { result } = renderHook(() => useAdminContent());
    expect(result.current.isLoading).toBe(true);
  });

  it("should process and return admin content correctly when data is available", () => {
    mockedUseBots.mockReturnValue({ data: mockBots, isLoading: false });
    mockedUseAnalytics.mockReturnValue({ data: mockAnalytics, isLoading: false });
    mockedUseLeads.mockReturnValue({ data: mockLeads, isLoading: false });

    const { result } = renderHook(() => useAdminContent());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.bots).toEqual(mockBots);
    expect(result.current.totals).toEqual(mockAnalytics.totals);
    expect(result.current.conversionRate).toBe("25.0");

    expect(result.current.pieData).toEqual([
      { name: "Old Bot", value: 2 },
      { name: "New Bot With A Very Long Name Indeed", value: 3 },
    ]);

    expect(result.current.botBarData).toEqual([
      {
        id: "bot-1",
        name: "Old Bot",
        rawName: "Old Bot",
        Interactions: 10,
        ContactsCollected: 2,
      },
      {
        id: "bot-2",
        name: "New Bot Wi…",
        rawName: "New Bot With A Very Long Name Indeed",
        Interactions: 10,
        ContactsCollected: 3,
      },
    ]);

    expect(result.current.recentBots).toHaveLength(4);
    expect(result.current.recentBots[0].id).toBe("bot-2");
    expect(result.current.recentBots[1].id).toBe("bot-5");

    expect(result.current.recentActivities).toHaveLength(4);
    expect(result.current.recentActivities[0].type).toBe("lead");
    expect(result.current.recentActivities[0].href).toBe("/admin/leads");
  });

  it("should return fallback recentActivities when bots and leads are empty", () => {
    mockedUseBots.mockReturnValue({ data: [], isLoading: false });
    mockedUseAnalytics.mockReturnValue({ data: undefined, isLoading: false });
    mockedUseLeads.mockReturnValue({ data: [], isLoading: false });

    const { result } = renderHook(() => useAdminContent());
    expect(result.current.recentActivities).toHaveLength(4);
    expect(result.current.recentActivities[0].title).toBe("New Lead Captured");
    expect(result.current.recentActivities[0].href).toBe("/admin/leads");
  });

  it("should return 0.0 conversionRate when total_conversations is 0 or missing", () => {
    mockedUseBots.mockReturnValue({ data: [], isLoading: false });
    mockedUseAnalytics.mockReturnValue({ data: { totals: { total_conversations: 0, total_leads: 0 } }, isLoading: false });
    mockedUseLeads.mockReturnValue({ data: [], isLoading: false });

    const { result } = renderHook(() => useAdminContent());
    expect(result.current.conversionRate).toBe("0.0");
  });

  it("should format dates correctly using formatDate helper", () => {
    mockedUseBots.mockReturnValue({ data: [], isLoading: false });
    mockedUseAnalytics.mockReturnValue({ data: undefined, isLoading: false });
    mockedUseLeads.mockReturnValue({ data: [], isLoading: false });

    const { result } = renderHook(() => useAdminContent());
    const formatted = result.current.formatDate("2025-01-15T00:00:00Z");
    expect(formatted).toContain("Jan");
    expect(formatted).toContain("15");
    expect(formatted).toContain("2025");
    expect(result.current.formatDate("")).toBe("");
  });

  it("should calculate formatTimeAgo correctly", () => {
    expect(formatTimeAgo("invalid", "02 min ago")).toBe("02 min ago");
    expect(formatTimeAgo(new Date(), "Just now")).toBe("Just now");
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatTimeAgo(fiveMinAgo)).toBe("05 min ago");
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatTimeAgo(twoHoursAgo)).toBe("02 hr ago");
  });
});
